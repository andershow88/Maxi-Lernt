import { prisma } from "@/lib/db";

export async function listGradesBySubject(subjectId: string) {
  return prisma.grade.findMany({
    where: { subjectId },
    orderBy: { date: "desc" },
  });
}

export async function getSubjectsWithGrades() {
  return prisma.subject.findMany({
    where: { hidden: false },
    orderBy: { order: "asc" },
    include: {
      grades: { orderBy: { date: "desc" } },
    },
  });
}

export async function getGrade(id: string) {
  return prisma.grade.findUnique({
    where: { id },
    include: { subject: true },
  });
}
