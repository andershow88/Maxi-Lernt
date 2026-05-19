"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TermSchema = z.object({
  term: z.string().min(1).max(200),
  explanation: z.string().optional().nullable(),
  translation: z.string().optional().nullable(),
  category: z.string().default("Sonstiges"),
});

export async function saveTermAction(data: z.infer<typeof TermSchema>) {
  const parsed = TermSchema.parse(data);
  const saved = await prisma.savedTerm.create({ data: parsed });
  revalidatePath("/erklaerer");
  revalidatePath("/erklaerer/verlauf");
  return { ok: true, id: saved.id };
}

export async function toggleFavoriteAction(id: string) {
  const term = await prisma.savedTerm.findUnique({ where: { id } });
  if (!term) return { ok: false };

  await prisma.savedTerm.update({
    where: { id },
    data: { favorite: !term.favorite },
  });

  revalidatePath("/erklaerer/verlauf");
  return { ok: true };
}

export async function updateTermCategoryAction(id: string, category: string) {
  await prisma.savedTerm.update({
    where: { id },
    data: { category },
  });
  revalidatePath("/erklaerer/verlauf");
  return { ok: true };
}

export async function deleteTermAction(id: string) {
  await prisma.savedTerm.delete({ where: { id } });
  revalidatePath("/erklaerer/verlauf");
  return { ok: true };
}
