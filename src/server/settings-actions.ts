"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: "default", decimalPlaces: 1, sortOrder: "best", theme: "light" },
    });
  }
  return settings;
}

export async function updateDecimalPlaces(value: number) {
  if (![0, 1, 2].includes(value)) return { ok: false };
  await prisma.settings.upsert({
    where: { id: "default" },
    update: { decimalPlaces: value },
    create: { id: "default", decimalPlaces: value },
  });
  revalidatePath("/");
  revalidatePath("/einstellungen");
  return { ok: true };
}

export async function updateSortOrder(value: string) {
  const allowed = ["best", "worst", "alpha", "nextExam", "improvement"];
  if (!allowed.includes(value)) return { ok: false };
  await prisma.settings.upsert({
    where: { id: "default" },
    update: { sortOrder: value },
    create: { id: "default", sortOrder: value },
  });
  revalidatePath("/");
  revalidatePath("/einstellungen");
  return { ok: true };
}
