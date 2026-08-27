import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET /api/cars - offentlig liste med filtre + paginering
// Kun FOR_SALE og RESERVED vises. DRAFT og SOLD er skjult fra hjemmesiden.
// Mærke, model, brændstof og gearkasse understøtter flervalg via kommasepareret liste, fx make=BMW,Volkswagen
router.get("/", async (req, res) => {
  const {
    make,
    model,
    fuel,
    transmission,
    priceFrom,
    priceTo,
    yearFrom,
    yearTo,
    kmFrom,
    kmTo,
    q,
    page = "1",
    pageSize = "12",
    sort = "newest",
  } = req.query as Record<string, string>;

  const where: any = {
    status: { in: ["FOR_SALE", "RESERVED"] },
  };

  const makes = parseList(make);
  const models = parseList(model);
  const fuels = parseList(fuel);
  const transmissions = parseList(transmission);

  if (makes.length) where.make = { in: makes };
  if (models.length) where.model = { in: models };
  if (fuels.length) where.fuel = { in: fuels };
  if (transmissions.length) where.transmission = { in: transmissions };
  if (priceFrom || priceTo) {
    where.price = {};
    if (priceFrom) where.price.gte = Number(priceFrom);
    if (priceTo) where.price.lte = Number(priceTo);
  }
  if (yearFrom || yearTo) {
    where.year = {};
    if (yearFrom) where.year.gte = Number(yearFrom);
    if (yearTo) where.year.lte = Number(yearTo);
  }
  if (kmFrom || kmTo) {
    where.mileage = {};
    if (kmFrom) where.mileage.gte = Number(kmFrom);
    if (kmTo) where.mileage.lte = Number(kmTo);
  }
  if (q) {
    where.OR = [
      { make: { contains: q } },
      { model: { contains: q } },
      { variant: { contains: q } },
    ];
  }

  const orderBy =
    sort === "price_asc" ? { price: "asc" as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    sort === "km_asc" ? { mileage: "asc" as const } :
    sort === "year_desc" ? { year: "desc" as const } :
    { createdAt: "desc" as const };

  const take = Math.min(Number(pageSize) || 12, 48);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.car.count({ where }),
  ]);

  res.json({
    items: items.map(serializeCar),
    total,
    page: Number(page) || 1,
    pageSize: take,
    totalPages: Math.max(1, Math.ceil(total / take)),
  });
});

// GET /api/cars/filters - dynamiske filtermuligheder baseret på aktive biler.
// Mærke/model/brændstof/gearkasse returneres som unikke værdier med antal (til flervalgs-UI).
router.get("/filters", async (_req, res) => {
  const cars = await prisma.car.findMany({
    where: { status: { in: ["FOR_SALE", "RESERVED"] } },
    select: { make: true, model: true, fuel: true, transmission: true, price: true, year: true, mileage: true },
  });

  const makes = countBy(cars.map((c) => c.make));
  const models = countBy(cars.map((c) => c.model));
  const fuels = countBy(cars.map((c) => c.fuel));
  const transmissions = countBy(cars.map((c) => c.transmission));
  const prices = cars.map((c) => c.price);
  const years = cars.map((c) => c.year);
  const kms = cars.map((c) => c.mileage);

  res.json({
    makes,
    models,
    fuels,
    transmissions,
    priceRange: [Math.min(0, ...prices), prices.length ? Math.max(...prices) : 0],
    yearRange: [years.length ? Math.min(...years) : 2000, years.length ? Math.max(...years) : new Date().getFullYear()],
    kmRange: [0, kms.length ? Math.max(...kms) : 0],
  });
});

// GET /api/cars/:slug - detaljeside. Skjuler nummerplade medmindre registrationPublic er sat.
router.get("/:slug", async (req, res) => {
  const car = await prisma.car.findUnique({
    where: { slug: req.params.slug },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!car || car.status === "DRAFT") {
    return res.status(404).json({ error: "Bilen blev ikke fundet." });
  }

  res.json(serializeCar(car, { includePrivate: false }));
});

export function serializeCar(car: any, opts: { includePrivate?: boolean } = { includePrivate: true }) {
  return {
    id: car.id,
    slug: car.slug,
    make: car.make,
    model: car.model,
    variant: car.variant,
    year: car.year,
    price: car.price,
    mileage: car.mileage,
    registration: car.registrationPublic || opts.includePrivate ? car.registration : null,
    registrationPublic: car.registrationPublic,
    vin: opts.includePrivate ? car.vin : undefined,
    fuel: car.fuel,
    transmission: car.transmission,
    horsepower: car.horsepower,
    color: car.color,
    description: car.description,
    equipment: safeParseJsonArray(car.equipment),
    status: car.status,
    images: (car.images || []).map((i: any) => ({ id: i.id, url: i.url, order: i.order })),
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
  };
}

export function safeParseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Splitter en kommasepareret query-param til en liste af trimmede, ikke-tomme værdier.
// "BMW,Volkswagen" -> ["BMW", "Volkswagen"]. Understøtter fortsat et enkelt mærke som før.
function parseList(param?: string): string[] {
  if (!param) return [];
  return param.split(",").map((s) => s.trim()).filter(Boolean);
}

// Tæller forekomster af hver unikke værdi og returnerer dem sorteret alfabetisk,
// så fx "Chevrolet" kun vises én gang i filtrene uanset hvor mange Chevrolet-biler der er på lager.
function countBy(items: string[]): { value: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) map.set(item, (map.get(item) || 0) + 1);
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value, "da"));
}

export default router;
