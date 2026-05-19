import { getSubjectsWithGrades } from "@/server/grade-queries";
import { getSettings } from "@/server/settings-actions";
import { GradeCalculator } from "@/components/werkzeuge/grade-calculator";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NotenrechnerPage() {
  const [subjects, settings] = await Promise.all([
    getSubjectsWithGrades(),
    getSettings(),
  ]);

  const data = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    color: s.color,
    grades: s.grades.map((g) => ({ value: g.value, weight: g.weight })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/werkzeuge" className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Notenrechner" description="Was passiert wenn du eine bestimmte Note schreibst?" />
      </div>
      <GradeCalculator subjects={data} decimals={settings.decimalPlaces} />
    </div>
  );
}
