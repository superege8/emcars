import baseSlugify from "slugify";
import { prisma } from "../db";

export function toSlug(input: string): string {
  return baseSlugify(input, { lower: true, strict: true, locale: "da" });
}

// Sikrer unikt slug ved at tilføje -2, -3, ... ved kollision. excludeId bruges ved redigering.
export async function uniqueCarSlug(base: string, excludeId?: string): Promise<string> {
  const baseSlug = toSlug(base);
  let slug = baseSlug;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.car.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
}
