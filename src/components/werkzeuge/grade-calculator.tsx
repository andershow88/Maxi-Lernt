"use client";

import { useState } from "react";
import { calculateWeightedAverage } from "@/lib/grades";
import { formatGrade, gradeColor } from "@/lib/utils";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

type SubjectData = {
  id: string;
  name: string;
  icon: string;
  color: string;
  grades: { value: number; weight: number }[];
};

const GRADE_STEPS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];
const WEIGHT_OPTIONS = [
  { value: 0.5, label: "½×" },
  { value: 1, label: "1×" },
  { value: 2, label: "2×" },
];

export function GradeCalculator({ subjects, decimals }: { subjects: SubjectData[]; decimals: number }) {
  const [selectedId, setSelectedId] = useState(subjects[0]?.id ?? "");
  const [simGrade, setSimGrade] = useState(2);
  const [simWeight, setSimWeight] = useState(2);

  const subject = subjects.find((s) => s.id === selectedId);
  if (!subject) return null;

  const currentAvg = calculateWeightedAverage(subject.grades);
  const simGrades = [...subject.grades, { value: simGrade, weight: simWeight }];
  const newAvg = calculateWeightedAverage(simGrades);
  const diff = currentAvg !== null && newAvg !== null ? newAvg - currentAvg : null;

  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[subject.icon] ?? Icons.BookOpen;

  return (
    <div className="space-y-5">
      {/* Subject picker */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {subjects.filter((s) => s.grades.length > 0).map((s) => {
          const I = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[s.icon] ?? Icons.BookOpen;
          const active = s.id === selectedId;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "flex items-center gap-2 shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition cursor-pointer",
                active ? "border-accent bg-accent/10 text-accent" : "border-border bg-bg-elevated text-muted hover:text-foreground",
              )}
            >
              <I className="h-3.5 w-3.5" />
              {s.name}
            </button>
          );
        })}
      </div>

      {/* Current state */}
      <div className="rounded-2xl border border-border/60 bg-bg-elevated p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: `${subject.color}18`, color: subject.color }}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{subject.name}</h3>
            <p className="text-xs text-muted">{subject.grades.length} Noten eingetragen</p>
          </div>
        </div>

        {/* Simulation result */}
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="text-center">
            <p className="text-xs text-muted mb-1">Aktuell</p>
            <span className="text-2xl font-bold" style={{ color: currentAvg !== null ? gradeColor(currentAvg) : undefined }}>
              {currentAvg !== null ? formatGrade(currentAvg, decimals) : "–"}
            </span>
          </div>
          <div className="text-2xl text-muted">→</div>
          <div className="text-center">
            <p className="text-xs text-muted mb-1">Danach</p>
            <span className="text-2xl font-bold" style={{ color: newAvg !== null ? gradeColor(newAvg) : undefined }}>
              {newAvg !== null ? formatGrade(newAvg, decimals) : "–"}
            </span>
          </div>
          {diff !== null && (
            <div className="text-center">
              <p className="text-xs text-muted mb-1">Differenz</p>
              <span className={cn("text-lg font-bold", diff < 0 ? "text-green-600" : diff > 0 ? "text-red-500" : "text-muted")}>
                {diff < 0 ? "" : "+"}{formatGrade(diff, decimals)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grade slider */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">Simulierte Note</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={simGrade}
            onChange={(e) => setSimGrade(Number(e.target.value))}
            className="flex-1 accent-accent h-2 rounded-full"
          />
          <span className="text-xl font-bold w-10 text-center" style={{ color: gradeColor(simGrade) }}>
            {formatGrade(simGrade, 1)}
          </span>
        </div>
        <div className="flex justify-between text-[10px] text-muted px-1">
          {GRADE_STEPS.filter((g) => g % 1 === 0).map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
      </div>

      {/* Weight picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Gewichtung</label>
        <div className="grid grid-cols-3 gap-2">
          {WEIGHT_OPTIONS.map((w) => (
            <button
              key={w.value}
              onClick={() => setSimWeight(w.value)}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-medium transition cursor-pointer",
                simWeight === w.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-bg-elevated text-muted hover:text-foreground",
              )}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
