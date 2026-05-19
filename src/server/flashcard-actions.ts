"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createFlashcard(front: string, back: string, subjectId?: string) {
  await prisma.flashcard.create({
    data: { front, back, subjectId: subjectId || null },
  });
  revalidatePath("/werkzeuge/karteikarten");
  return { ok: true };
}

export async function getDueFlashcards(subjectId?: string) {
  const where: Record<string, unknown> = { nextReview: { lte: new Date() } };
  if (subjectId) where.subjectId = subjectId;

  return prisma.flashcard.findMany({
    where,
    include: { subject: true },
    orderBy: { nextReview: "asc" },
    take: 20,
  });
}

export async function getAllFlashcards(subjectId?: string) {
  const where: Record<string, unknown> = {};
  if (subjectId) where.subjectId = subjectId;

  return prisma.flashcard.findMany({
    where,
    include: { subject: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function reviewFlashcard(id: string, correct: boolean) {
  const card = await prisma.flashcard.findUnique({ where: { id } });
  if (!card) return { ok: false };

  const newLevel = correct ? Math.min(card.level + 1, 5) : 0;
  const intervals = [0, 1, 3, 7, 14, 30];
  const days = intervals[newLevel] ?? 30;
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + days);

  await prisma.flashcard.update({
    where: { id },
    data: { level: newLevel, nextReview },
  });

  revalidatePath("/werkzeuge/karteikarten");
  return { ok: true };
}

export async function deleteFlashcard(id: string) {
  await prisma.flashcard.delete({ where: { id } });
  revalidatePath("/werkzeuge/karteikarten");
  return { ok: true };
}
