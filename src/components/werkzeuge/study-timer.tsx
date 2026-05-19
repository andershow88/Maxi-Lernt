"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square, Clock } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createStudySession } from "@/server/study-session-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type SubjectStat = {
  id: string;
  name: string;
  icon: string;
  color: string;
  weekMinutes: number;
  monthMinutes: number;
};

type Stats = {
  weekTotal: number;
  monthTotal: number;
  subjects: SubjectStat[];
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatMinutes(min: number) {
  if (min < 60) return `${min} Min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function StudyTimer({ stats }: { stats: Stats }) {
  const [selectedId, setSelectedId] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  async function handleStop() {
    setRunning(false);
    const minutes = Math.max(1, Math.round(elapsed / 60));
    if (selectedId && elapsed > 30) {
      await createStudySession(selectedId, minutes);
      router.refresh();
    }
    setElapsed(0);
  }

  const maxWeek = Math.max(1, ...stats.subjects.map((s) => s.weekMinutes));

  return (
    <div className="space-y-5">
      {/* Timer */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-5xl font-mono font-bold text-foreground tracking-wider">{formatTime(elapsed)}</p>
          </div>

          {!running && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {stats.subjects.map((s) => {
                const I = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[s.icon] ?? Icons.BookOpen;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={cn(
                      "flex items-center gap-1.5 shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition cursor-pointer",
                      selectedId === s.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-bg-elevated text-muted",
                    )}
                  >
                    <I className="h-3.5 w-3.5" /> {s.name}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            {!running ? (
              <Button onClick={() => setRunning(true)} disabled={!selectedId} className="flex-1">
                <Play className="h-4 w-4" /> Starten
              </Button>
            ) : (
              <Button variant="danger" onClick={handleStop} className="flex-1">
                <Square className="h-4 w-4" /> Stoppen & Speichern
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly stats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Diese Woche</h3>
          <span className="text-xs font-medium text-accent">{formatMinutes(stats.weekTotal)} gesamt</span>
        </div>
        <div className="space-y-2">
          {stats.subjects.filter((s) => s.weekMinutes > 0).map((s) => {
            const I = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[s.icon] ?? Icons.BookOpen;
            const pct = (s.weekMinutes / maxWeek) * 100;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                  <I className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground truncate">{s.name}</span>
                    <span className="text-[11px] text-muted">{formatMinutes(s.weekMinutes)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border/40 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              </div>
            );
          })}
          {stats.subjects.every((s) => s.weekMinutes === 0) && (
            <p className="text-xs text-muted text-center py-4">Noch keine Lernzeit diese Woche. Starte den Timer!</p>
          )}
        </div>
      </div>

      {/* Monthly total */}
      <div className="flex items-center gap-3 rounded-xl bg-surface/50 border border-border/40 px-4 py-3">
        <Clock className="h-4 w-4 text-muted" />
        <span className="text-xs text-muted">Diesen Monat insgesamt:</span>
        <span className="text-sm font-semibold text-foreground ml-auto">{formatMinutes(stats.monthTotal)}</span>
      </div>
    </div>
  );
}
