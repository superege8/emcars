import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import leadsRoutes from "./routes/leads";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const prisma = new PrismaClient();

// =========================
// CORS
// =========================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Tillad requests uden Origin-header
      // fx server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Tillad vores kendte origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Tillad Vercel deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Ikke tilladt af CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// =========================
// ROUTES
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leads", leadsRoutes);

// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "EM Cars backend virker",
  });
});

// =========================
// HENT ALLE BILER
// =========================

app.get("/api/cars", async (_req, res) => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        status: "FOR_SALE",
      },

      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
        dealer: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(cars);
  } catch (error) {
    console.error("Fejl ved hentning af biler:", error);

    res.status(500).json({
      error: "Kunne ikke hente biler",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

// =========================
// HENT ÉN BIL
// =========================

app.get("/api/cars/:id", async (req, res) => {
  try {
    const car = await prisma.car.findUnique({
      where: {
        id: req.params.id,
      },

      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
        dealer: true,
      },
    });

    if (!car) {
      return res.status(404).json({
        error: "Bilen blev ikke fundet",
      });
    }

    res.json(car);
  } catch (error) {
    console.error("Fejl ved hentning af bil:", error);

    res.status(500).json({
      error: "Kunne ikke hente bilen",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

// =========================
// OPRET BIL
// =========================

app.post("/api/cars", async (req, res) => {
  try {
    const {
      dealerId,
      make,
      model,
      variant,
      year,
      price,
      mileage,
      registration,
      registrationPublic,
      vin,
      fuel,
      transmission,
      horsepower,
      color,
      description,
      equipment,
      status,
      slug,
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (
      !dealerId ||
      !make ||
      !model ||
      year === undefined ||
      year === null ||
      year === "" ||
      price === undefined ||
      price === null ||
      price === "" ||
      mileage === undefined ||
      mileage === null ||
      mileage === "" ||
      !transmission
    ) {
      return res.status(400).json({
        error:
          "dealerId, make, model, year, price, mileage og transmission er påkrævet",
      });
    }

    // =========================
    // FIND DEALER
    // =========================

    const dealer = await prisma.dealer.findUnique({
      where: {
        id: String(dealerId),
      },
    });

    if (!dealer) {
      return res.status(400).json({
        error: "Dealer blev ikke fundet",
      });
    }

    // =========================
    // SLUG
    // =========================

    const baseSlug =
      slug ||
      `${make}-${model}-${variant || ""}-${Date.now()}`
        .toLowerCase()
        .replace(/æ/g, "ae")
        .replace(/ø/g, "oe")
        .replace(/å/g, "aa")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // =========================
    // EQUIPMENT
    // =========================

    let equipmentValue = "[]";

    if (Array.isArray(equipment)) {
      equipmentValue = JSON.stringify(equipment);
    } else if (typeof equipment === "string") {
      equipmentValue = equipment;
    }

    // =========================
    // OPRET BIL
    // =========================

    const car = await prisma.car.create({
      data: {
        dealer: {
          connect: {
            id: String(dealerId),
          },
        },

        slug: baseSlug,

        make: String(make),

        model: String(model),

        variant:
          variant !== undefined &&
          variant !== null &&
          variant !== ""
            ? String(variant)
            : null,

        year: Number(year),

        price: Number(price),

        mileage: Number(mileage),

        registration:
          registration !== undefined &&
          registration !== null &&
          registration !== ""
            ? String(registration)
            : null,

        registrationPublic:
          registrationPublic === true ||
          registrationPublic === "true",

        vin:
          vin !== undefined &&
          vin !== null &&
          vin !== ""
            ? String(vin)
            : null,

        fuel:
          fuel !== undefined &&
          fuel !== null &&
          fuel !== ""
            ? String(fuel)
            : "BENZIN",

        transmission: String(transmission),

        horsepower:
          horsepower !== undefined &&
          horsepower !== null &&
          horsepower !== ""
            ? Number(horsepower)
            : null,

        color:
          color !== undefined &&
          color !== null &&
          color !== ""
            ? String(color)
            : null,

        description:
          description !== undefined &&
          description !== null
            ? String(description)
            : "",

        equipment: equipmentValue,

        status:
          status !== undefined &&
          status !== null &&
          status !== ""
            ? String(status)
            : "FOR_SALE",
      },

      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
        dealer: true,
      },
    });

    res.status(201).json(car);
  } catch (error) {
    console.error("Fejl ved oprettelse af bil:", error);

    res.status(500).json({
      error: "Kunne ikke oprette bilen",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

// =========================
// OPDATER BIL
// =========================

app.put("/api/cars/:id", async (req, res) => {
  try {
    const {
      make,
      model,
      variant,
      year,
      price,
      mileage,
      registration,
      registrationPublic,
      vin,
      fuel,
      transmission,
      horsepower,
      color,
      description,
      equipment,
      status,
      slug,
    } = req.body;

    // =========================
    // FIND EKSISTERENDE BIL
    // =========================

    const existingCar = await prisma.car.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existingCar) {
      return res.status(404).json({
        error: "Bilen blev ikke fundet",
      });
    }

    // =========================
    // EQUIPMENT
    // =========================

    let equipmentValue: string | undefined = undefined;

    if (equipment !== undefined) {
      if (Array.isArray(equipment)) {
        equipmentValue = JSON.stringify(equipment);
      } else if (typeof equipment === "string") {
        equipmentValue = equipment;
      } else {
        equipmentValue = "[]";
      }
    }

    // =========================
    // OPDATER BIL
    // =========================

    const car = await prisma.car.update({
      where: {
        id: req.params.id,
      },

      data: {
        ...(make !== undefined && {
          make: String(make),
        }),

        ...(model !== undefined && {
          model: String(model),
        }),

        ...(variant !== undefined && {
          variant:
            variant === null || variant === ""
              ? null
              : String(variant),
        }),

        ...(year !== undefined && {
          year: Number(year),
        }),

        ...(price !== undefined && {
          price: Number(price),
        }),

        ...(mileage !== undefined && {
          mileage: Number(mileage),
        }),

        ...(registration !== undefined && {
          registration:
            registration === null || registration === ""
              ? null
              : String(registration),
        }),

        ...(registrationPublic !== undefined && {
          registrationPublic:
            registrationPublic === true ||
            registrationPublic === "true",
        }),

        ...(vin !== undefined && {
          vin:
            vin === null || vin === ""
              ? null
              : String(vin),
        }),

        ...(fuel !== undefined && {
          fuel:
            fuel === null || fuel === ""
              ? "BENZIN"
              : String(fuel),
        }),

        ...(transmission !== undefined && {
          transmission: String(transmission),
        }),

        ...(horsepower !== undefined && {
          horsepower:
            horsepower === null || horsepower === ""
              ? null
              : Number(horsepower),
        }),

        ...(color !== undefined && {
          color:
            color === null || color === ""
              ? null
              : String(color),
        }),

        ...(description !== undefined && {
          description:
            description === null
              ? ""
              : String(description),
        }),

        ...(equipmentValue !== undefined && {
          equipment: equipmentValue,
        }),

        ...(status !== undefined && {
          status: String(status),
        }),

        ...(slug !== undefined && {
          slug: String(slug),
        }),
      },

      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
        dealer: true,
      },
    });

    res.json(car);
  } catch (error) {
    console.error("Fejl ved opdatering af bil:", error);

    res.status(500).json({
      error: "Kunne ikke opdatere bilen",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

// =========================
// SLET BIL
// =========================

app.delete("/api/cars/:id", async (req, res) => {
  try {
    const existingCar = await prisma.car.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existingCar) {
      return res.status(404).json({
        error: "Bilen blev ikke fundet",
      });
    }

    const car = await prisma.car.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      message: "Bilen blev slettet",
      car,
    });
  } catch (error) {
    console.error("Fejl ved sletning af bil:", error);

    res.status(500).json({
      error: "Kunne ikke slette bilen",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log(
    `EM Cars backend kører på port ${PORT}`
  );
});

// =========================
// GRACEFUL SHUTDOWN
// =========================

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});