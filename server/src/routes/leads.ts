import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";

const router = Router();

const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
  carId: z.string().optional(),
  type: z.enum(["GENERAL", "BIL_FORSPORGSEL", "FINANSIERING"]).optional(),
});

// POST /api/leads - kontaktformular (generel, bil-forespørgsel via "Kontakt om denne bil"-knap, eller finansiering)
router.post("/", async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Udfyld navn, email og besked." });
  }
  const data = parsed.data;

  const dealer = await prisma.dealer.findFirst();
  if (!dealer) return res.status(500).json({ error: "Ingen forhandler konfigureret." });

  if (data.carId) {
    const car = await prisma.car.findUnique({ where: { id: data.carId } });
    if (!car) return res.status(404).json({ error: "Bilen findes ikke." });
  }

  const lead = await prisma.lead.create({
    data: {
      dealerId: dealer.id,
      carId: data.carId,
      type: data.type || (data.carId ? "BIL_FORSPORGSEL" : "GENERAL"),
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    },
  });

  res.status(201).json({ ok: true, id: lead.id });
});

export default router;
