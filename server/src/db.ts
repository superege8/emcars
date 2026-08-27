import { PrismaClient } from "@prisma/client";

// Genbrug samme Prisma-instans ved hot-reload i dev
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;
