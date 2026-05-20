"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { calculateWeightedAverage } from "@/lib/grades";

export async function getStudents() {
  await requireAdmin();

  const students = await prisma.user.findMany({
    where: { role: "SCHUELER" },
    include: {
      grades: { include: { subject: true } },
      _count: { select: { grades: true, events: true, flashcards: true } },
    },
    orderBy: { name: "asc" },
  });

  return students.map((s) => {
    const subjectMap = new Map<string, { value: number; weight: number }[]>();
    for (const g of s.grades) {
      const arr = subjectMap.get(g.subjectId) ?? [];
      arr.push({ value: g.value, weight: g.weight });
      subjectMap.set(g.subjectId, arr);
    }

    const subjectAvgs = [...subjectMap.values()].map((gs) => calculateWeightedAverage(gs)).filter((a): a is number => a !== null);
    const overall = subjectAvgs.length > 0 ? subjectAvgs.reduce((a, b) => a + b, 0) / subjectAvgs.length : null;

    return {
      id: s.id,
      name: s.name,
      username: s.username,
      classCode: s.classCode,
      createdAt: s.createdAt,
      gradeCount: s._count.grades,
      eventCount: s._count.events,
      flashcardCount: s._count.flashcards,
      overallAvg: overall,
    };
  });
}

export async function getStudentDetail(studentId: string) {
  await requireAdmin();

  const student = await prisma.user.findUnique({
    where: { id: studentId, role: "SCHUELER" },
    include: {
      grades: { include: { subject: true }, orderBy: { date: "desc" } },
      events: { include: { subject: true }, orderBy: { date: "desc" }, take: 10 },
    },
  });

  return student;
}

export async function getInviteCodes() {
  await requireAdmin();
  return prisma.inviteCode.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createInviteCode(code: string, className: string) {
  await requireAdmin();
  await prisma.inviteCode.create({ data: { code, className } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteInviteCode(id: string) {
  await requireAdmin();
  await prisma.inviteCode.delete({ where: { id } });
  revalidatePath("/admin");
  return { ok: true };
}
