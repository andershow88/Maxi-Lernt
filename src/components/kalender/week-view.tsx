"use client";

import { useState, useEffect, useTransition } from "react";
import { ChevronLeft, ChevronRight, Plus, Check, Circle, Calendar, Clock, FileText, Trash2, ChevronDown, MapPin } from "lucide-react";
import { format, addWeeks, startOfWeek, addDays, isSameDay, isToday, isPast } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, eventTypeLabel } from "@/lib/utils";
import { toggleStudyDayAction, deleteEventAction } from "@/server/event-actions";

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

const TYPE_STYLES: Record<string, { bg: string; border: string; dot: string }> = {
  SCHULAUFGABE: { bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
  EX: { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  TEST: { bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  REFERAT: { bg: "bg-purple-50", border: "border-purple-200", dot: "bg-purple-500" },
  HAUSAUFGABE: { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500" },
  LERNTERMIN: { bg: "bg-green-50", border: "border-green-200", dot: "bg-green-500" },
  SONSTIGER: { bg: "bg-slate-50", border: "border-slate-200", dot: "bg-slate-400" },
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
            const past = isPast(addDays(day, 1)) && !today;

            return (
              <DayRow
                key={day.toISOString()}
                day={day}
                events={dayEvents}
                studyDays={dayStudy}
                isToday={today}
                isPast={past}
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
  isPast,
}: {
  day: Date;
  events: EventData[];
  studyDays: StudyDayData[];
  isToday: boolean;
  isPast: boolean;
}) {
  const hasContent = events.length > 0 || studyDays.length > 0;

  return (
    <div className={cn(
      "rounded-xl border transition",
      isToday ? "border-accent/40 bg-accent/5" : "border-border/40 bg-bg-elevated",
      !hasContent && isPast && "opacity-40",
      !hasContent && !isPast && "opacity-60",
    )}>
      <div className="flex items-center gap-2 px-3 py-2">
        <div className={cn(
          "grid h-9 w-9 place-items-center rounded-lg text-sm font-bold shrink-0",
          isToday ? "bg-accent text-white" : "bg-surface text-foreground",
        )}>
          {format(day, "d")}
        </div>
        <div>
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider",
            isToday ? "text-accent" : "text-muted",
          )}>
            {format(day, "EEEE", { locale: de })}
          </span>
          <span className={cn(
            "text-[11px] ml-1.5",
            isToday ? "text-accent/70" : "text-subtle",
          )}>
            {format(day, "d. MMMM", { locale: de })}
          </span>
        </div>
        {isToday && <Badge variant="accent" className="ml-auto">Heute</Badge>}
        {!hasContent && !isToday && (
          <span className="ml-auto text-[10px] text-subtle">Frei</span>
        )}
      </div>

      {hasContent && (
        <div className="px-3 pb-2.5 space-y-1.5">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
          {studyDays.map((sd) => (
            <StudyDayToggle key={sd.id} studyDay={sd} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: EventData }) {
  const [open, setOpen] = useState(false);
  const [deleting, startTransition] = useTransition();
  const router = useRouter();
  const style = TYPE_STYLES[event.type] ?? TYPE_STYLES.SONSTIGER;
  const studyTotal = event.studyDays.length;
  const studyDone = event.studyDays.filter((d) => d.completed).length;

  function handleDelete() {
    if (!confirm("Termin wirklich löschen?")) return;
    startTransition(async () => {
      await deleteEventAction(event.id);
      router.refresh();
      window.location.reload();
    });
  }

  return (
    <div className={cn("rounded-lg border overflow-hidden", style.border, style.bg)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left cursor-pointer"
      >
        <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", style.dot)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{event.title}</span>
            <Badge variant={event.type === "SCHULAUFGABE" ? "danger" : event.type === "EX" ? "warning" : "default"} className="shrink-0">
              {eventTypeLabel(event.type)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {event.subject && (
              <span className="text-[11px] font-medium" style={{ color: event.subject.color }}>
                {event.subject.name}
              </span>
            )}
            {event.time && (
              <span className="text-[11px] text-muted flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" /> {event.time}
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted shrink-0 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-border/20 pt-2.5">
          {event.note && (
            <div className="flex items-start gap-2">
              <FileText className="h-3.5 w-3.5 text-muted mt-0.5 shrink-0" />
              <p className="text-xs text-foreground leading-relaxed">{event.note}</p>
            </div>
          )}

          {studyTotal > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted font-medium">Lernfortschritt</span>
                <span className="text-[11px] font-semibold text-foreground">{studyDone}/{studyTotal} Tage</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${(studyDone / studyTotal) * 100}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-[11px] text-red-500 hover:text-red-700 transition cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            {deleting ? "Wird gelöscht..." : "Termin löschen"}
          </button>
        </div>
      )}
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
      className="flex items-center gap-2.5 w-full rounded-lg border border-border/30 bg-surface/30 px-3 py-2 text-left cursor-pointer group"
    >
      {completed ? (
        <Check className="h-4 w-4 text-success shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-subtle group-hover:text-accent shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-sm",
          completed ? "text-muted line-through" : "text-foreground",
        )}>
          Lernen: {studyDay.event.subject?.name ?? studyDay.event.title}
        </span>
      </div>
      {studyDay.event.studyMinutesPerDay && (
        <span className="text-[10px] text-subtle shrink-0">
          {studyDay.event.studyMinutesPerDay} Min.
        </span>
      )}
    </button>
  );
}
