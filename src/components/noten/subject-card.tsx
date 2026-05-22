"use client";

import { useState } from "react";
import Link from "next/link";
import { MotivationHint } from "./improvement-hint";
import { calculateWeightedAverage, getMotivationHint } from "@/lib/grades";
import { formatGrade, gradeTypeLabel, gradeColor } from "@/lib/utils";
import { ChevronDown, Pencil, Plus, Calendar } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import type { Subject, Grade } from "@prisma/client";

const TYPE_COLORS: Record<string, string> = {
  SCHULAUFGABE: "bg-red-500/15 text-red-500 border-red-500/30",
  EX: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  MUENDLICH: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  SONSTIGE: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const WEIGHT_LABELS: Record<number, string> = { 0.5: "halbe", 1: "einfach", 2: "doppelt" };

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function SubjectCard({
  subject,
  grades,
  decimals,
}: {
  subject: Subject;
  grades: Grade[];
  decimals: number;
}) {
  const [open, setOpen] = useState(false);
  const avg = calculateWeightedAverage(grades.map((g) => ({ value: g.value, weight: g.weight })));
  const hint = avg !== null ? getMotivationHint(avg) : null;
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[subject.icon] ?? Icons.BookOpen;

  const best = grades.length > 0 ? Math.min(...grades.map((g) => g.value)) : null;
  const worst = grades.length > 0 ? Math.max(...grades.map((g) => g.value)) : null;

  const schulaufgaben = grades.filter((g) => g.type === "SCHULAUFGABE").length;
  const exen = grades.filter((g) => g.type === "EX").length;
  const muendlich = grades.filter((g) => g.type === "MUENDLICH").length;

  // Average position on 1-6 scale as percentage (1=100%, 6=0%)
  const barPercent = avg !== null ? Math.max(0, Math.min(100, ((6 - avg) / 5) * 100)) : 0;
  const barColor = avg !== null ? gradeColor(avg) : "var(--muted)";

  return (
    <div className="rounded-2xl border border-border/60 bg-bg-elevated overflow-hidden transition-shadow hover:shadow-md">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
      >
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: `${subject.color}18`, color: subject.color }}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground truncate">{subject.name}</h3>
            {avg !== null ? (
              <span className="text-xl font-bold shrink-0" style={{ color: gradeColor(avg) }}>
                {formatGrade(avg, decimals)}
              </span>
            ) : (
              <span className="text-sm text-muted shrink-0">–</span>
            )}
          </div>

          {grades.length > 0 ? (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-muted">{grades.length} {grades.length === 1 ? "Note" : "Noten"}</span>
              {best !== null && (
                <span className="text-[11px]">
                  <span className="text-muted">Beste </span>
                  <span className="font-semibold" style={{ color: gradeColor(best) }}>{formatGrade(best, 0)}</span>
                </span>
              )}
              {worst !== null && worst !== best && (
                <span className="text-[11px]">
                  <span className="text-muted">Schlechteste </span>
                  <span className="font-semibold" style={{ color: gradeColor(worst) }}>{formatGrade(worst, 0)}</span>
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-subtle mt-0.5">Noch keine Noten</p>
          )}

          {/* Average bar */}
          {avg !== null && (
            <div className="mt-2 h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${barPercent}%`, backgroundColor: barColor }}
              />
            </div>
          )}
        </div>

        <ChevronDown className={cn("h-4 w-4 text-muted shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {/* Expanded — grade details */}
      {open && (
        <div className="border-t border-border/40">
          {/* Stats row */}
          {grades.length > 0 && (
            <div className="flex gap-2 px-4 py-2.5 bg-surface/30">
              {schulaufgaben > 0 && (
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border", TYPE_COLORS.SCHULAUFGABE)}>
                  {schulaufgaben} SA
                </span>
              )}
              {exen > 0 && (
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border", TYPE_COLORS.EX)}>
                  {exen} Ex
                </span>
              )}
              {muendlich > 0 && (
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border", TYPE_COLORS.MUENDLICH)}>
                  {muendlich} Mdl
                </span>
              )}
            </div>
          )}

          {/* Grade list */}
          <div className="divide-y divide-border/30">
            {grades.map((g) => (
              <div key={g.id} className="flex items-center gap-3 px-4 py-3 group">
                {/* Grade value */}
                <span
                  className="text-lg font-bold w-8 text-center shrink-0"
                  style={{ color: gradeColor(g.value) }}
                >
                  {formatGrade(g.value, decimals)}
                </span>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold border", TYPE_COLORS[g.type] ?? TYPE_COLORS.SONSTIGE)}>
                      {gradeTypeLabel(g.type)}
                    </span>
                    {g.weight !== 1 && (
                      <span className="text-[10px] text-muted font-medium">
                        {WEIGHT_LABELS[g.weight] ?? `${g.weight}×`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(g.date)}
                    </span>
                    {g.note && (
                      <span className="text-[11px] text-subtle truncate">{g.note}</span>
                    )}
                  </div>
                </div>

                {/* Edit */}
                <Link
                  href={`/noten/${g.id}/bearbeiten`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted opacity-0 group-hover:opacity-100 hover:bg-surface hover:text-foreground transition cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Motivation */}
          {hint && <MotivationHint message={hint} />}

          {/* Add grade */}
          <div className="border-t border-border/40">
            <Link
              href={`/noten/neu?fach=${subject.id}`}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-accent hover:bg-surface/50 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Note eintragen
            </Link>
          </div>
        </div>
      )}

      {/* Collapsed quick add */}
      {!open && (
        <div className="flex border-t border-border/40">
          <Link
            href={`/noten/neu?fach=${subject.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-accent hover:bg-surface/50 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Note eintragen
          </Link>
        </div>
      )}
    </div>
  );
}
