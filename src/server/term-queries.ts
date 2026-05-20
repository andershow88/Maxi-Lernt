import { prisma } from "@/lib/db";

export async function listSavedTerms(userId: string, category?: string) {
  return prisma.savedTerm.findMany({
    where: { userId, ...(category && category !== "Alle" ? { category } : {}) },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFavoriteTerms(userId: string) {
  return prisma.savedTerm.findMany({
    where: { userId, favorite: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTermCategories(userId: string) {
  const terms = await prisma.savedTerm.groupBy({
    by: ["category"],
    where: { userId },
    _count: true,
    orderBy: { category: "asc" },
  });
  return terms.map((t) => ({ category: t.category, count: t._count }));
}
