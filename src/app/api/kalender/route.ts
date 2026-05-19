import { getEventsForWeek, getStudyDaysForWeek } from "@/server/event-queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const weekStr = searchParams.get("week");
  const weekStart = weekStr ? new Date(weekStr) : new Date();

  const [events, studyDays] = await Promise.all([
    getEventsForWeek(weekStart),
    getStudyDaysForWeek(weekStart),
  ]);

  return Response.json({ events, studyDays });
}
