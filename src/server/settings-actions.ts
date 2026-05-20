"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const user = await requireUser();
  let settings = await prisma.settings.findUnique({ where: { userId: user.id } });
  if (!settings) {
    settings = await prisma.settings.create({
      data: { userId: user.id, decimalPlaces: 1, sortOrder: "best", theme: "light" },
    });
  }
  return settings;
}

export async function updateDecimalPlaces(value: number) {
  const user = await requireUser();
  if (![0, 1, 2].includes(value)) return { ok: false };
  await prisma.settings.upsert({
    where: { userId: user.id },
    update: { decimalPlaces: value },
    create: { userId: user.id, decimalPlaces: value },
  });
  revalidatePath("/");
  revalidatePath("/einstellungen");
  return { ok: true };
}

export async function updateSortOrder(value: string) {
  const user = await requireUser();
  const allowed = ["best", "worst", "alpha", "nextExam", "improvement"];
  if (!allowed.includes(value)) return { ok: false };
  await prisma.settings.upsert({
    where: { userId: user.id },
    update: { sortOrder: value },
    create: { userId: user.id, sortOrder: value },
  });
  revalidatePath("/");
  revalidatePath("/einstellungen");
  return { ok: true };
}
