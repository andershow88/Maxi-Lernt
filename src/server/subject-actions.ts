"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SubjectSchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().default("BookOpen"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#4F46E5"),
});

export async function createSubjectAction(formData: FormData) {
  const data = SubjectSchema.parse({
    name: formData.get("name"),
    icon: formData.get("icon") || "BookOpen",
    color: formData.get("color") || "#4F46E5",
  });

  const maxOrder = await prisma.subject.aggregate({ _max: { order: true } });
  await prisma.subject.create({
    data: { ...data, order: (maxOrder._max.order ?? 0) + 1 },
  });

  revalidatePath("/");
  revalidatePath("/faecher");
  return { ok: true };
}

export async function updateSubjectAction(id: string, formData: FormData) {
  const data = SubjectSchema.parse({
    name: formData.get("name"),
    icon: formData.get("icon") || "BookOpen",
    color: formData.get("color") || "#4F46E5",
  });

  await prisma.subject.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/faecher");
  return { ok: true };
}

export async function toggleSubjectVisibility(id: string) {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) return { ok: false };

  await prisma.subject.update({
    where: { id },
    data: { hidden: !subject.hidden },
  });

  revalidatePath("/");
  revalidatePath("/faecher");
  return { ok: true };
}

export async function deleteSubjectAction(id: string) {
  await prisma.subject.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/faecher");
  return { ok: true };
}
