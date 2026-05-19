import { prisma } from "@/lib/db";

export async function listSubjects() {
  return prisma.subject.findMany({
    where: { hidden: false },
    orderBy: { order: "asc" },
  });
}

export async function listAllSubjects() {
  return prisma.subject.findMany({ orderBy: { order: "asc" } });
}

export async function getSubject(id: string) {
  return prisma.subject.findUnique({ where: { id } });
}
