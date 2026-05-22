"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SubjectSchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().default("BookOpen"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#4F46E5"),
});

export async function createSubjectAction(formData: FormData) {
  const user = await requireUser();
  const data = SubjectSchema.parse({
    name: formData.get("name"),
    icon: formData.get("icon") || "BookOpen",
    color: formData.get("color") || "#4F46E5",
  });

  const maxOrder = await prisma.subject.aggregate({
    where: { userId: user.id },
    _max: { order: true },
  });
  await prisma.subject.create({
    data: { ...data, userId: user.id, order: (maxOrder._max.order ?? 0) + 1 },
  });

  revalidatePath("/");
  revalidatePath("/faecher");
  return { ok: true };
}

export async function updateSubjectAction(id: string, formData: FormData) {
  const user = await requireUser();
  const data = SubjectSchema.parse({
    name: formData.get("name"),
    icon: formData.get("icon") || "BookOpen",
    color: formData.get("color") || "#4F46E5",
  });

  await prisma.subject.update({ where: { id, userId: user.id }, data });
  revalidatePath("/");
  revalidatePath("/faecher");
  return { ok: true };
}

export async function toggleSubjectVisibility(id: string) {
  const user = await requireUser();
  const subject = await prisma.subject.findFirst({ where: { id, userId: user.id } });
  if (!subject) return { ok: false };

  await prisma.subject.update({
    where: { id, userId: user.id },
    data: { hidden: !subject.hidden },
  });

  revalidatePath("/");
  revalidatePath("/faecher");
  return { ok: true };
}

export async function deleteSubjectAction(id: string) {
  const user = await requireUser();
  await prisma.subject.delete({ where: { id, userId: user.id } });
  revalidatePath("/");
  revalidatePath("/faecher");
  return { ok: true };
}
