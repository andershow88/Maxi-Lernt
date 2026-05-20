"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addDays, differenceInDays } from "date-fns";

const EventSchema = z.object({
  subjectId: z.string().optional().transform((v) => v || null),
  title: z.string().min(1).max(200),
  date: z.coerce.date(),
  time: z.string().optional().transform((v) => v || null),
  type: z.enum(["SCHULAUFGABE", "EX", "TEST", "REFERAT", "HAUSAUFGABE", "LERNTERMIN", "SONSTIGER"]),
  note: z.string().optional().transform((v) => v || null),
  studyStartDate: z.coerce.date().optional().nullable(),
  studyMinutesPerDay: z.coerce.number().min(0).optional().nullable(),
});

export async function createEventAction(formData: FormData) {
  const user = await requireUser();
  const raw = {
    subjectId: formData.get("subjectId"),
    title: formData.get("title"),
    date: formData.get("date"),
    time: formData.get("time"),
    type: formData.get("type"),
    note: formData.get("note"),
    studyStartDate: formData.get("studyStartDate") || null,
    studyMinutesPerDay: formData.get("studyMinutesPerDay") || null,
  };

  const data = EventSchema.parse(raw);

  const event = await prisma.calendarEvent.create({ data: { ...data, userId: user.id } });

  if (data.studyStartDate && data.date) {
    const days = differenceInDays(data.date, data.studyStartDate);
    if (days > 0) {
      const studyDays = Array.from({ length: days }, (_, i) => ({
        eventId: event.id,
        date: addDays(data.studyStartDate!, i),
      }));
      await prisma.studyDay.createMany({ data: studyDays });
    }
  }

  revalidatePath("/kalender");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteEventAction(id: string) {
  const user = await requireUser();
  await prisma.calendarEvent.delete({ where: { id, userId: user.id } });
  revalidatePath("/kalender");
  return { ok: true };
}

export async function toggleStudyDayAction(id: string) {
  const user = await requireUser();
  const day = await prisma.studyDay.findFirst({
    where: { id, event: { userId: user.id } },
  });
  if (!day) return { ok: false };

  await prisma.studyDay.update({
    where: { id },
    data: {
      completed: !day.completed,
      completedAt: !day.completed ? new Date() : null,
    },
  });

  revalidatePath("/kalender");
  return { ok: true };
}
