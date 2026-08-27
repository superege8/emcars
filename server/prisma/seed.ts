import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const dealer = await prisma.dealer.upsert({
    where: { slug: "em-cars" },

    update: {},

    create: {
      name: "EM Cars",
      slug: "em-cars",
      email: "kontakt@emcars.dk",
      phone: "+45 42 31 83 38",
      address: "Violvej 9",
      city: "8600 Silkeborg",
    },
  });

  const adminEmail =
    process.env.SEED_ADMIN_EMAIL || "admin@emcars.dk";

  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD || "EMCars2026!";

  const passwordHash = await bcrypt.hash(
    adminPassword,
    10
  );

  await prisma.user.upsert({
    where: {
      email: adminEmail,
    },

    update: {
      passwordHash,
      name: "Admin",
      role: "OWNER",
      dealerId: dealer.id,
    },

    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
      role: "OWNER",
      dealerId: dealer.id,
    },
  });

  await prisma.carImage.deleteMany({
    where: {
      car: {
        vin: {
          startsWith: "DEMO-",
        },
      },
    },
  });

  await prisma.car.deleteMany({
    where: {
      vin: {
        startsWith: "DEMO-",
      },
    },
  });

  const demoCars = [
    {
      make: "BMW",
      model: "3-Serie",
      variant: "320d Touring M-Sport",
      year: 2021,
      price: 389900,
      mileage: 42000,
      fuel: "DIESEL",
      transmission: "AUTOMATIK",
      horsepower: 190,
      color: "Sort metallic",
      registration: "AB12345",
      registrationPublic: true,
      description:
        "Velholdt BMW 320d Touring med M-Sport pakke. Servicebog forefindes.",
      equipment: [
        "Navigation",
        "Skindsæder",
        "Adaptiv fartpilot",
        "Bakkamera",
        "Soltag",
      ],
      status: "FOR_SALE",
    },
    {
      make: "Audi",
      model: "A4",
      variant: "2.0 TDI Avant S-line",
      year: 2020,
      price: 349000,
      mileage: 58000,
      fuel: "DIESEL",
      transmission: "MANUEL",
      horsepower: 150,
      color: "Hvid",
      registration: "CD67890",
      registrationPublic: false,
      description:
        "Flot Audi A4 Avant med S-line udstyr og lav km-stand.",
      equipment: [
        "Virtual Cockpit",
        "LED-forlygter",
        "Parkeringssensorer",
      ],
      status: "FOR_SALE",
    },
    {
      make: "Volkswagen",
      model: "ID.4",
      variant: "Pro Performance",
      year: 2022,
      price: 429900,
      mileage: 21000,
      fuel: "EL",
      transmission: "AUTOMATIK",
      horsepower: 204,
      color: "Blå",
      registration: "EF11223",
      registrationPublic: true,
      description:
        "100% elektrisk familie-SUV med lang rækkevidde og hurtig opladning.",
      equipment: [
        "360-kamera",
        "Head-up display",
        "Varmepumpe",
        "Nøglefri adgang",
      ],
      status: "FOR_SALE",
    },
    {
      make: "Volvo",
      model: "XC60",
      variant: "B4 Momentum",
      year: 2019,
      price: 299000,
      mileage: 87000,
      fuel: "HYBRID",
      transmission: "AUTOMATIK",
      horsepower: 197,
      color: "Grå",
      registration: "GH44556",
      registrationPublic: false,
      description:
        "Rummelig og sikker SUV, perfekt til familien.",
      equipment: [
        "Panoramatag",
        "Anhængertræk",
        "Aircondition",
      ],
      status: "RESERVED",
    },
    {
      make: "Skoda",
      model: "Octavia",
      variant: "1.5 TSI Combi",
      year: 2018,
      price: 189900,
      mileage: 112000,
      fuel: "BENZIN",
      transmission: "MANUEL",
      horsepower: 150,
      color: "Rød",
      registration: "IJ77889",
      registrationPublic: false,
      description:
        "Solgt bil - vises som eksempel på 'Solgt'-status (skjules automatisk fra hjemmesiden).",
      equipment: [
        "Cruise control",
        "Bluetooth",
      ],
      status: "SOLD",
    },
  ];

  for (const c of demoCars) {
    const baseSlug = slugify(
      `${c.make}-${c.model}-${c.variant}-${c.year}`
    );

    let slug = baseSlug;
    let n = 1;

    while (
      await prisma.car.findUnique({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${++n}`;
    }

    const car = await prisma.car.create({
      data: {
        dealerId: dealer.id,
        make: c.make,
        model: c.model,
        variant: c.variant,
        year: c.year,
        price: c.price,
        mileage: c.mileage,
        registration: c.registration,
        registrationPublic: c.registrationPublic,
        vin: `DEMO-${slug}`,
        fuel: c.fuel,
        transmission: c.transmission,
        horsepower: c.horsepower,
        color: c.color,
        description: c.description,
        equipment: JSON.stringify(c.equipment),
        status: c.status,
        slug,
        publishedAt:
          c.status !== "DRAFT" ? new Date() : null,
        soldAt:
          c.status === "SOLD" ? new Date() : null,
      },
    });

    await prisma.carImage.create({
      data: {
        carId: car.id,
        url: `https://picsum.photos/seed/${car.slug}/1200/800`,
        order: 0,
      },
    });

    await prisma.carImage.create({
      data: {
        carId: car.id,
        url: `https://picsum.photos/seed/${car.slug}-2/1200/800`,
        order: 1,
      },
    });
  }

  console.log("");
  console.log("==============================");
  console.log("     EM CARS SEED FÆRDIG");
  console.log("==============================");
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Admin kode:  ${adminPassword}`);
  console.log("==============================");
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });