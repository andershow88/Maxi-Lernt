import { getSubjectsWithGrades } from "@/server/grade-queries";
import { getSettings } from "@/server/settings-actions";
import { calculateWeightedAverage, calculateOverallAverage } from "@/lib/grades";
import { formatGrade, gradeColor } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function getZeugnisNote(avg: number): number {
  return avg < 1.5 ? 1 : Math.round(avg);
}

export default async function ZeugnisPage() {
  const [subjects, settings] = await Promise.all([
    getSubjectsWithGrades(),
    getSettings(),
  ]);

  const rows = subjects.map((s) => {
    const avg = calculateWeightedAverage(s.grades.map((g) => ({ value: g.value, weight: g.weight })));
    return { ...s, avg, zeugnis: avg !== null ? getZeugnisNote(avg) : null };
  });

  const avgs = rows.map((r) => r.avg);
  const overall = calculateOverallAverage(avgs);
  const overallZeugnis = overall !== null ? getZeugnisNote(overall) : null;

  const zeugnisLabels: Record<number, string> = {
    1: "sehr gut", 2: "gut", 3: "befriedigend", 4: "ausreichend", 5: "mangelhaft", 6: "ungenügend",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/werkzeuge" className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Zeugnis-Vorschau" description="So würde dein Zeugnis aktuell aussehen." />
      </div>

      {/* Overall */}
      {overallZeugnis !== null && (
        <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5 text-center space-y-1">
          <p className="text-xs font-medium text-muted">Gesamtdurchschnitt</p>
          <span className="text-4xl font-bold" style={{ color: gradeColor(overall!) }}>
            {formatGrade(overall!, settings.decimalPlaces)}
          </span>
          <p className="text-sm font-semibold text-foreground">
            Zeugnisnote: {overallZeugnis} — {zeugnisLabels[overallZeugnis]}
          </p>
        </div>
      )}

      {/* Subject list */}
      <div className="rounded-2xl border border-border/60 bg-bg-elevated overflow-hidden divide-y divide-border/30">
        {rows.map((r) => {
          const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[r.icon] ?? Icons.BookOpen;
          return (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3">
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `${r.color}15`, color: r.color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                {r.avg !== null && (
                  <p className="text-[11px] text-muted">
                    Schnitt {formatGrade(r.avg, settings.decimalPlaces)}
                  </p>
                )}
              </div>
              {r.zeugnis !== null ? (
                <div className="text-right shrink-0">
                  <span className="text-xl font-bold" style={{ color: gradeColor(r.zeugnis) }}>
                    {r.zeugnis}
                  </span>
                  <p className="text-[10px] text-muted">{zeugnisLabels[r.zeugnis]}</p>
                </div>
              ) : (
                <span className="text-sm text-muted">–</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
