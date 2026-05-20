import { prisma } from "@/lib/db";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

export async function getEventsForWeek(userId: string, weekStart: Date) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });

  return prisma.calendarEvent.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    include: {
      subject: true,
      studyDays: {
        where: {
          date: { gte: start, lte: end },
        },
      },
    },
    orderBy: { date: "asc" },
  });
}

export async function getStudyDaysForWeek(userId: string, weekStart: Date) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });

  return prisma.studyDay.findMany({
    where: {
      date: { gte: start, lte: end },
      event: { userId },
    },
    include: {
      event: { include: { subject: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function getUpcomingEvents(userId: string, limit = 5) {
  return prisma.calendarEvent.findMany({
    where: { userId, date: { gte: new Date() } },
    include: { subject: true },
    orderBy: { date: "asc" },
    take: limit,
  });
}

export async function getEvent(userId: string, id: string) {
  return prisma.calendarEvent.findFirst({
    where: { id, userId },
    include: { subject: true, studyDays: true },
  });
}
