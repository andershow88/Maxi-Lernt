import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");

  if (!startStr || !endStr) {
    return Response.json({ events: [], studyDays: [] });
  }

  const start = new Date(startStr);
  const end = new Date(endStr);

  const [events, studyDays] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: { date: { gte: start, lte: end } },
      include: { subject: true, studyDays: { where: { date: { gte: start, lte: end } } } },
      orderBy: { date: "asc" },
    }),
    prisma.studyDay.findMany({
      where: { date: { gte: start, lte: end } },
      include: { event: { include: { subject: true } } },
      orderBy: { date: "asc" },
    }),
  ]);

  return Response.json({ events, studyDays });
}
