import { prisma } from "@/lib/db";

export async function listGradesBySubject(userId: string, subjectId: string) {
  return prisma.grade.findMany({
    where: { subjectId, userId },
    orderBy: { date: "desc" },
  });
}

export async function getSubjectsWithGrades(userId: string) {
  return prisma.subject.findMany({
    where: { hidden: false, userId },
    orderBy: { order: "asc" },
    include: {
      grades: { where: { userId }, orderBy: { date: "desc" } },
    },
  });
}

export async function getGrade(userId: string, id: string) {
  return prisma.grade.findFirst({
    where: { id, userId },
    include: { subject: true },
  });
}
