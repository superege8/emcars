import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { serializeCar, safeParseJsonArray } from "./cars";
import { uniqueCarSlug } from "../utils/slugify";

const router = Router();
router.use(requireAuth); // ALT under /api/admin kræver login

// ---------- DASHBOARD ----------
router.get("/dashboard", async (req, res) => {
  const dealerId = req.user!.dealerId;
  const [forSale, reserved, sold, latest] = await Promise.all([
    prisma.car.count({ where: { dealerId, status: "FOR_SALE" } }),
    prisma.car.count({ where: { dealerId, status: "RESERVED" } }),
    prisma.car.count({ where: { dealerId, status: "SOLD" } }),
    prisma.car.findMany({
      where: { dealerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
  ]);

  res.json({
    counts: { forSale, reserved, sold },
    latest: latest.map((c) => serializeCar(c)),
  });
});

// ---------- CARS (admin) ----------
router.get("/cars", async (req, res) => {
  const dealerId = req.user!.dealerId;
  const { q, status, page = "1", pageSize = "20" } = req.query as Record<string, string>;

  const where: any = { dealerId };
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { make: { contains: q } },
      { model: { contains: q } },
      { variant: { contains: q } },
      { registration: { contains: q } },
    ];
  }

  const take = Math.min(Number(pageSize) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.car.count({ where }),
  ]);

  res.json({
    items: items.map((c) => serializeCar(c)),
    total,
    page: Number(page) || 1,
    totalPages: Math.max(1, Math.ceil(total / take)),
  });
});

router.get("/cars/:id", async (req, res) => {
  const car = await prisma.car.findFirst({
    where: { id: req.params.id, dealerId: req.user!.dealerId },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!car) return res.status(404).json({ error: "Bilen blev ikke fundet." });
  res.json(serializeCar(car));
});

const carSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  variant: z.string().optional(),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  price: z.coerce.number().int().min(0),
  mileage: z.coerce.number().int().min(0),
  registration: z.string().optional(),
  registrationPublic: z.coerce.boolean().optional(),
  vin: z.string().optional(),
  fuel: z.enum(["BENZIN", "DIESEL", "EL", "HYBRID", "PLUGIN_HYBRID"]),
  transmission: z.enum(["MANUEL", "AUTOMATIK"]),
  horsepower: z.coerce.number().int().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  equipment: z.array(z.string()).optional(),
});

router.post("/cars", async (req, res) => {
  const parsed = carSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ugyldige felter.", details: parsed.error.flatten() });
  }
  const data = parsed.data;
  const dealerId = req.user!.dealerId;

  const slug = await uniqueCarSlug(`${data.make}-${data.model}-${data.variant || ""}-${data.year}`);

  const car = await prisma.car.create({
    data: {
      dealerId,
      make: data.make,
      model: data.model,
      variant: data.variant,
      year: data.year,
      price: data.price,
      mileage: data.mileage,
      registration: data.registration,
      registrationPublic: !!data.registrationPublic,
      vin: data.vin,
      fuel: data.fuel,
      transmission: data.transmission,
      horsepower: data.horsepower,
      color: data.color,
      description: data.description || "",
      equipment: JSON.stringify(data.equipment || []),
      status: "DRAFT",
      slug,
    },
    include: { images: true },
  });

  res.status(201).json(serializeCar(car));
});

router.put("/cars/:id", async (req, res) => {
  const existing = await prisma.car.findFirst({ where: { id: req.params.id, dealerId: req.user!.dealerId } });
  if (!existing) return res.status(404).json({ error: "Bilen blev ikke fundet." });

  const parsed = carSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ugyldige felter.", details: parsed.error.flatten() });
  }
  const data = parsed.data;

  let slug = existing.slug;
  if (data.make || data.model || data.variant || data.year) {
    slug = await uniqueCarSlug(
      `${data.make ?? existing.make}-${data.model ?? existing.model}-${data.variant ?? existing.variant ?? ""}-${data.year ?? existing.year}`,
      existing.id
    );
  }

  const car = await prisma.car.update({
    where: { id: existing.id },
    data: {
      ...(data.make && { make: data.make }),
      ...(data.model && { model: data.model }),
      variant: data.variant ?? existing.variant,
      ...(data.year && { year: data.year }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.mileage !== undefined && { mileage: data.mileage }),
      registration: data.registration ?? existing.registration,
      ...(data.registrationPublic !== undefined && { registrationPublic: data.registrationPublic }),
      vin: data.vin ?? existing.vin,
      ...(data.fuel && { fuel: data.fuel }),
      ...(data.transmission && { transmission: data.transmission }),
      horsepower: data.horsepower ?? existing.horsepower,
      color: data.color ?? existing.color,
      description: data.description ?? existing.description,
      ...(data.equipment && { equipment: JSON.stringify(data.equipment) }),
      slug,
    },
    include: { images: { orderBy: { order: "asc" } } },
  });

  res.json(serializeCar(car));
});

router.delete("/cars/:id", async (req, res) => {
  const existing = await prisma.car.findFirst({ where: { id: req.params.id, dealerId: req.user!.dealerId } });
  if (!existing) return res.status(404).json({ error: "Bilen blev ikke fundet." });

  const images = await prisma.carImage.findMany({ where: { carId: existing.id } });
  for (const img of images) deleteImageFile(img.url);

  await prisma.car.delete({ where: { id: existing.id } });
  res.json({ ok: true });
});

// Publicer, sæt kladde, reserver, marker solgt
const statusSchema = z.object({ status: z.enum(["DRAFT", "FOR_SALE", "RESERVED", "SOLD"]) });
router.put("/cars/:id/status", async (req, res) => {
  const existing = await prisma.car.findFirst({ where: { id: req.params.id, dealerId: req.user!.dealerId } });
  if (!existing) return res.status(404).json({ error: "Bilen blev ikke fundet." });

  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Ugyldig status." });

  const { status } = parsed.data;
  const car = await prisma.car.update({
    where: { id: existing.id },
    data: {
      status,
      publishedAt: status !== "DRAFT" && !existing.publishedAt ? new Date() : existing.publishedAt,
      soldAt: status === "SOLD" ? new Date() : status === "FOR_SALE" || status === "RESERVED" ? null : existing.soldAt,
    },
    include: { images: { orderBy: { order: "asc" } } },
  });

  res.json(serializeCar(car));
});

// ---------- IMAGES ----------
const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.mimetype)) {
      return cb(new Error("Kun billeder (JPEG, PNG, WEBP, AVIF) er tilladt."));
    }
    cb(null, true);
  },
});

function deleteImageFile(url: string) {
  const filename = path.basename(url);
  const filePath = path.join(uploadDir, filename);
  fs.promises.unlink(filePath).catch(() => {});
}

// POST /api/admin/cars/:id/images - upload flere billeder på én gang, komprimeres til webp
router.post("/cars/:id/images", upload.array("images", 20), async (req, res) => {
  const car = await prisma.car.findFirst({ where: { id: req.params.id, dealerId: req.user!.dealerId } });
  if (!car) return res.status(404).json({ error: "Bilen blev ikke fundet." });

  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) return res.status(400).json({ error: "Ingen billeder modtaget." });

  const currentMax = await prisma.carImage.aggregate({
    where: { carId: car.id },
    _max: { order: true },
  });
  let order = (currentMax._max.order ?? -1) + 1;

  const created = [];
  for (const file of files) {
    const filename = `${randomUUID()}.webp`;
    const outPath = path.join(uploadDir, filename);
    // Komprimér + resize til max 1920px bredde, konverter til webp
    await sharp(file.buffer)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);

    const img = await prisma.carImage.create({
      data: { carId: car.id, url: `/uploads/${filename}`, order: order++ },
    });
    created.push(img);
  }

  res.status(201).json({ images: created });
});

router.delete("/cars/:id/images/:imageId", async (req, res) => {
  const car = await prisma.car.findFirst({ where: { id: req.params.id, dealerId: req.user!.dealerId } });
  if (!car) return res.status(404).json({ error: "Bilen blev ikke fundet." });

  const image = await prisma.carImage.findFirst({ where: { id: req.params.imageId, carId: car.id } });
  if (!image) return res.status(404).json({ error: "Billedet blev ikke fundet." });

  deleteImageFile(image.url);
  await prisma.carImage.delete({ where: { id: image.id } });
  res.json({ ok: true });
});

// PUT /api/admin/cars/:id/images/order  { order: ["imgId1","imgId2", ...] } - første billede = hovedbillede
const orderSchema = z.object({ order: z.array(z.string()) });
router.put("/cars/:id/images/order", async (req, res) => {
  const car = await prisma.car.findFirst({ where: { id: req.params.id, dealerId: req.user!.dealerId } });
  if (!car) return res.status(404).json({ error: "Bilen blev ikke fundet." });

  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Ugyldig rækkefølge." });

  await Promise.all(
    parsed.data.order.map((imageId, index) =>
      prisma.carImage.updateMany({ where: { id: imageId, carId: car.id }, data: { order: index } })
    )
  );

  const images = await prisma.carImage.findMany({ where: { carId: car.id }, orderBy: { order: "asc" } });
  res.json({ images });
});

// ---------- LEADS (admin overblik) ----------
router.get("/leads", async (req, res) => {
  const leads = await prisma.lead.findMany({
    where: { dealerId: req.user!.dealerId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { car: { select: { make: true, model: true, slug: true } } },
  });
  res.json({ items: leads });
});

export default router;
