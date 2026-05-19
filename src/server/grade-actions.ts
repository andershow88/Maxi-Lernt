"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const GradeSchema = z.object({
  subjectId: z.string().min(1),
  value: z.coerce.number().min(1).max(6),
  weight: z.coerce.number().refine((v) => [0.5, 1, 2].includes(v)),
  type: z.enum(["SCHULAUFGABE", "EX", "MUENDLICH", "SONSTIGE"]),
  date: z.coerce.date(),
  note: z.string().optional().transform((v) => v || null),
});

export async function createGradeAction(formData: FormData) {
  const data = GradeSchema.parse({
    subjectId: formData.get("subjectId"),
    value: formData.get("value"),
    weight: formData.get("weight"),
    type: formData.get("type"),
    date: formData.get("date"),
    note: formData.get("note"),
  });

  await prisma.grade.create({ data });
  revalidatePath("/");
  return { ok: true };
}

export async function updateGradeAction(id: string, formData: FormData) {
  const data = GradeSchema.parse({
    subjectId: formData.get("subjectId"),
    value: formData.get("value"),
    weight: formData.get("weight"),
    type: formData.get("type"),
    date: formData.get("date"),
    note: formData.get("note"),
  });

  await prisma.grade.update({ where: { id }, data });
  revalidatePath("/");
  return { ok: true };
}

export async function deleteGradeAction(id: string) {
  await prisma.grade.delete({ where: { id } });
  revalidatePath("/");
  return { ok: true };
}
