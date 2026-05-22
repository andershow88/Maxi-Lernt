"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createFlashcard(front: string, back: string, subjectId?: string) {
  const user = await requireUser();
  await prisma.flashcard.create({
    data: { front, back, subjectId: subjectId || null, userId: user.id },
  });
  revalidatePath("/werkzeuge/karteikarten");
  return { ok: true };
}

export async function getDueFlashcards(subjectId?: string) {
  const user = await requireUser();
  const where: Record<string, unknown> = { userId: user.id, nextReview: { lte: new Date() } };
  if (subjectId) where.subjectId = subjectId;

  return prisma.flashcard.findMany({
    where,
    include: { subject: true },
    orderBy: { nextReview: "asc" },
    take: 20,
  });
}

export async function getAllFlashcards(subjectId?: string) {
  const user = await requireUser();
  const where: Record<string, unknown> = { userId: user.id };
  if (subjectId) where.subjectId = subjectId;

  return prisma.flashcard.findMany({
    where,
    include: { subject: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function reviewFlashcard(id: string, correct: boolean) {
  const user = await requireUser();
  const card = await prisma.flashcard.findFirst({ where: { id, userId: user.id } });
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
  const user = await requireUser();
  await prisma.flashcard.delete({ where: { id, userId: user.id } });
  revalidatePath("/werkzeuge/karteikarten");
  return { ok: true };
}
