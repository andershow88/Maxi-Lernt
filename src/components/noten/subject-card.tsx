"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GradeCircle } from "./grade-circle";
import { ImprovementHint } from "./improvement-hint";
import { calculateWeightedAverage, getImprovementHint } from "@/lib/grades";
import { formatGrade, gradeTypeLabel, weightLabel } from "@/lib/utils";
import * as Icons from "lucide-react";
import type { Subject, Grade } from "@prisma/client";

export function SubjectCard({
  subject,
  grades,
  decimals,
}: {
  subject: Subject;
  grades: Grade[];
  decimals: number;
}) {
  const avg = calculateWeightedAverage(grades.map((g) => ({ value: g.value, weight: g.weight })));
  const hint = avg !== null ? getImprovementHint(avg, grades.map((g) => ({ value: g.value, weight: g.weight }))) : null;
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[subject.icon] ?? Icons.BookOpen;

  return (
    <div className="rounded-2xl border border-border/60 bg-bg-elevated overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 p-4">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: `${subject.color}18`, color: subject.color }}
        >
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground truncate">{subject.name}</h3>
            <GradeCircle value={avg} decimals={decimals} size="md" />
          </div>
          {grades.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {grades.slice(0, 8).map((g) => (
                <Link key={g.id} href={`/noten/${g.id}/bearbeiten`}>
                  <Badge variant="default" className="text-[10px] gap-0.5 cursor-pointer hover:ring-1 hover:ring-accent transition">
                    <span className="font-bold">{formatGrade(g.value, 0)}</span>
                    <span className="text-subtle">{weightLabel(g.weight)}</span>
                    <span className="text-subtle">{gradeTypeLabel(g.type).slice(0, 2)}</span>
                  </Badge>
                </Link>
              ))}
              {grades.length > 8 && (
                <Badge variant="default" className="text-[10px]">+{grades.length - 8}</Badge>
              )}
            </div>
          )}
          {grades.length === 0 && (
            <p className="text-xs text-subtle mt-1">Noch keine Noten eingetragen</p>
          )}
        </div>
      </div>
      {hint && (
        <ImprovementHint hint={hint} />
      )}
      <div className="flex border-t border-border/40">
        <Link
          href={`/noten/neu?fach=${subject.id}`}
          className="flex-1 px-4 py-2.5 text-center text-xs font-medium text-accent hover:bg-surface/50 transition"
        >
          + Note eintragen
        </Link>
      </div>
    </div>
  );
}
