"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export async function createStudySession(subjectId: string, minutes: number) {
  await prisma.studySession.create({ data: { subjectId, minutes } });
  revalidatePath("/werkzeuge/lernzeit");
  return { ok: true };
}

export async function getStudyStats() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [weekSessions, monthSessions, subjects] = await Promise.all([
    prisma.studySession.findMany({
      where: { date: { gte: weekStart, lte: weekEnd } },
      include: { subject: true },
    }),
    prisma.studySession.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
      include: { subject: true },
    }),
    prisma.subject.findMany({ where: { hidden: false }, orderBy: { order: "asc" } }),
  ]);

  const weekBySubject = new Map<string, number>();
  for (const s of weekSessions) {
    weekBySubject.set(s.subjectId, (weekBySubject.get(s.subjectId) ?? 0) + s.minutes);
  }

  const monthBySubject = new Map<string, number>();
  for (const s of monthSessions) {
    monthBySubject.set(s.subjectId, (monthBySubject.get(s.subjectId) ?? 0) + s.minutes);
  }

  const weekTotal = weekSessions.reduce((sum, s) => sum + s.minutes, 0);
  const monthTotal = monthSessions.reduce((sum, s) => sum + s.minutes, 0);

  return {
    weekTotal,
    monthTotal,
    subjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      icon: s.icon,
      color: s.color,
      weekMinutes: weekBySubject.get(s.id) ?? 0,
      monthMinutes: monthBySubject.get(s.id) ?? 0,
    })),
  };
}
