import { prisma } from "@/lib/db";

export async function listSavedTerms(category?: string) {
  return prisma.savedTerm.findMany({
    where: category && category !== "Alle" ? { category } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getFavoriteTerms() {
  return prisma.savedTerm.findMany({
    where: { favorite: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTermCategories() {
  const terms = await prisma.savedTerm.groupBy({
    by: ["category"],
    _count: true,
    orderBy: { category: "asc" },
  });
  return terms.map((t) => ({ category: t.category, count: t._count }));
}
