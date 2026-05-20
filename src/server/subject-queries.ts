import { prisma } from "@/lib/db";

export async function listSubjects(userId: string) {
  return prisma.subject.findMany({
    where: { hidden: false, userId },
    orderBy: { order: "asc" },
  });
}

export async function listAllSubjects(userId: string) {
  return prisma.subject.findMany({ where: { userId }, orderBy: { order: "asc" } });
}

export async function getSubject(userId: string, id: string) {
  return prisma.subject.findFirst({ where: { id, userId } });
}
