import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GradeCircle } from "@/components/noten/grade-circle";
import { SubjectCard } from "@/components/noten/subject-card";
import { SortSelect } from "@/components/noten/sort-select";
import { getSubjectsWithGrades } from "@/server/grade-queries";
import { getSettings } from "@/server/settings-actions";
import { calculateWeightedAverage, calculateOverallAverage, getMotivationalMessage } from "@/lib/grades";
import { BarChart3 } from "lucide-react";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NotenPage() {
  const user = await requireUser();
  const [subjectsRaw, settings] = await Promise.all([
    getSubjectsWithGrades(user.id),
    getSettings(),
  ]);

  const subjectsWithAvg = subjectsRaw.map((s) => {
    const avg = calculateWeightedAverage(s.grades.map((g) => ({ value: g.value, weight: g.weight })));
    return { ...s, avg };
  });

  const sorted = [...subjectsWithAvg].sort((a, b) => {
    switch (settings.sortOrder) {
      case "best":
        if (a.avg === null) return 1;
        if (b.avg === null) return -1;
        return a.avg - b.avg;
      case "worst":
        if (a.avg === null) return 1;
        if (b.avg === null) return -1;
        return b.avg - a.avg;
      case "alpha":
        return a.name.localeCompare(b.name, "de");
      case "improvement":
        if (a.avg === null) return 1;
        if (b.avg === null) return -1;
        return b.avg - a.avg;
      default:
        return a.order - b.order;
    }
  });

  const overallAvg = calculateOverallAverage(subjectsWithAvg.map((s) => s.avg));
  const motivation = getMotivationalMessage(overallAvg);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 py-4">
        <GradeCircle value={overallAvg} decimals={settings.decimalPlaces} size="lg" label="Gesamtschnitt" />
        <p className="text-sm font-medium text-accent text-center">{motivation}</p>
      </div>

      <div className="flex items-center justify-between">
        <SortSelect current={settings.sortOrder} />
        <Link href="/noten/neu">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" /> Note
          </Button>
        </Link>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-6 w-6" />}
          title="Keine Fächer vorhanden"
          description="Füge zuerst deine Schulfächer hinzu."
          action={
            <Link href="/faecher">
              <Button>Fächer verwalten</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              grades={s.grades}
              decimals={settings.decimalPlaces}
            />
          ))}
        </div>
      )}
    </div>
  );
}
