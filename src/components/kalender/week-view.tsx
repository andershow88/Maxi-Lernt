"use client";

import { useState, useEffect, useTransition } from "react";
import { ChevronLeft, ChevronRight, Plus, Check, Circle, Calendar } from "lucide-react";
import { format, addWeeks, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, eventTypeLabel } from "@/lib/utils";
import { toggleStudyDayAction } from "@/server/event-actions";

type EventData = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  type: string;
  note: string | null;
  subject: { name: string; color: string } | null;
  studyDays: { id: string; date: string; completed: boolean }[];
};

type StudyDayData = {
  id: string;
  date: string;
  completed: boolean;
  event: {
    id: string;
    title: string;
    studyMinutesPerDay: number | null;
    subject: { name: string; color: string } | null;
  };
};

export function WeekView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState<EventData[]>([]);
  const [studyDays, setStudyDays] = useState<StudyDayData[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    setLoading(true);
    fetch(`/api/kalender?week=${weekStart.toISOString()}`)
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events ?? []);
        setStudyDays(data.studyDays ?? []);
      })
      .finally(() => setLoading(false));
  }, [weekOffset]);

  const weekLabel = `${format(days[0], "d. MMM", { locale: de })} – ${format(days[6], "d. MMM yyyy", { locale: de })}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface hover:text-foreground transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground min-w-[180px] text-center">
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface hover:text-foreground transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-accent font-medium hover:underline cursor-pointer"
            >
              Heute
            </button>
          )}
          <Link href="/kalender/neu">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" /> Termin
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-surface/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {days.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
            const dayStudy = studyDays.filter((s) => isSameDay(new Date(s.date), day));
            const today = isToday(day);

            return (
              <DayRow
                key={day.toISOString()}
                day={day}
                events={dayEvents}
                studyDays={dayStudy}
                isToday={today}
              />
            );
          })}
        </div>
      )}

      {!loading && events.length === 0 && studyDays.length === 0 && (
        <EmptyState
          icon={<Calendar className="h-6 w-6" />}
          title="Keine Termine diese Woche"
          description="Trage Schulaufgaben und Lerntermine ein."
          action={
            <Link href="/kalender/neu"><Button>Termin hinzufügen</Button></Link>
          }
        />
      )}
    </div>
  );
}

function DayRow({
  day,
  events,
  studyDays,
  isToday,
}: {
  day: Date;
  events: EventData[];
  studyDays: StudyDayData[];
  isToday: boolean;
}) {
  const hasContent = events.length > 0 || studyDays.length > 0;

  return (
    <div className={cn(
      "rounded-xl border p-3 transition",
      isToday ? "border-accent/40 bg-accent/5" : "border-border/40 bg-bg-elevated",
      !hasContent && "opacity-60",
    )}>
      <div className="flex items-center gap-2 mb-1">
        <span className={cn(
          "text-xs font-bold uppercase tracking-wider",
          isToday ? "text-accent" : "text-muted",
        )}>
          {format(day, "EEE", { locale: de })}
        </span>
        <span className={cn(
          "text-xs font-medium",
          isToday ? "text-accent" : "text-subtle",
        )}>
          {format(day, "d. MMMM", { locale: de })}
        </span>
        {isToday && <Badge variant="accent" className="ml-auto">Heute</Badge>}
      </div>

      {events.map((e) => (
        <div key={e.id} className="flex items-center gap-2 mt-1.5 pl-1">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: e.subject?.color ?? "var(--accent)" }} />
          <span className="text-sm text-foreground font-medium">{e.title}</span>
          <Badge variant={e.type === "SCHULAUFGABE" ? "danger" : e.type === "EX" ? "warning" : "default"}>
            {eventTypeLabel(e.type)}
          </Badge>
          {e.subject && <span className="text-[10px] text-subtle">{e.subject.name}</span>}
        </div>
      ))}

      {studyDays.map((sd) => (
        <StudyDayToggle key={sd.id} studyDay={sd} />
      ))}
    </div>
  );
}

function StudyDayToggle({ studyDay }: { studyDay: StudyDayData }) {
  const [, startTransition] = useTransition();
  const [completed, setCompleted] = useState(studyDay.completed);

  function toggle() {
    setCompleted(!completed);
    startTransition(() => { toggleStudyDayAction(studyDay.id); });
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 mt-1.5 pl-1 w-full text-left cursor-pointer group"
    >
      {completed ? (
        <Check className="h-4 w-4 text-success shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-subtle group-hover:text-accent shrink-0" />
      )}
      <span className={cn(
        "text-sm",
        completed ? "text-muted line-through" : "text-foreground",
      )}>
        Lernen: {studyDay.event.subject?.name ?? studyDay.event.title}
      </span>
      {studyDay.event.studyMinutesPerDay && (
        <span className="text-[10px] text-subtle ml-auto">
          {studyDay.event.studyMinutesPerDay} Min.
        </span>
      )}
    </button>
  );
}
