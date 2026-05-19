import { prisma } from "@/lib/db";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

export async function getEventsForWeek(weekStart: Date) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });

  return prisma.calendarEvent.findMany({
    where: {
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

export async function getStudyDaysForWeek(weekStart: Date) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });

  return prisma.studyDay.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    include: {
      event: { include: { subject: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function getUpcomingEvents(limit = 5) {
  return prisma.calendarEvent.findMany({
    where: { date: { gte: new Date() } },
    include: { subject: true },
    orderBy: { date: "asc" },
    take: limit,
  });
}

export async function getEvent(id: string) {
  return prisma.calendarEvent.findUnique({
    where: { id },
    include: { subject: true, studyDays: true },
  });
}
