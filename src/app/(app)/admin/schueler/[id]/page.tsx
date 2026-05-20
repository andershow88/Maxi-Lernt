import { redirect, notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getStudentDetail } from "@/server/admin-actions";
import { calculateWeightedAverage, calculateOverallAverage } from "@/lib/grades";
import { formatGrade, gradeColor, gradeTypeLabel, eventTypeLabel } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin().catch(() => redirect("/login"));
  const { id } = await params;
  const student = await getStudentDetail(id);
  if (!student) notFound();

  const subjectMap = new Map<string, { name: string; color: string; grades: { value: number; weight: number }[] }>();
  for (const g of student.grades) {
    const existing = subjectMap.get(g.subjectId) ?? { name: g.subject.name, color: g.subject.color, grades: [] };
    existing.grades.push({ value: g.value, weight: g.weight });
    subjectMap.set(g.subjectId, existing);
  }

  const subjects = [...subjectMap.entries()].map(([id, s]) => ({
    id,
    name: s.name,
    color: s.color,
    avg: calculateWeightedAverage(s.grades),
    count: s.grades.length,
  }));

  const overall = calculateOverallAverage(subjects.map((s) => s.avg));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title={student.name} description={`@${student.username} · Klasse ${student.classCode ?? "–"}`} />
      </div>

      {overall !== null && (
        <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5 text-center">
          <p className="text-xs text-muted mb-1">Gesamtdurchschnitt</p>
          <span className="text-3xl font-bold" style={{ color: gradeColor(overall) }}>{formatGrade(overall, 1)}</span>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Fächer</h3>
        <div className="space-y-2">
          {subjects.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-bg-elevated px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm font-medium text-foreground">{s.name}</span>
                <span className="text-[11px] text-muted">{s.count} Noten</span>
              </div>
              {s.avg !== null && (
                <span className="text-lg font-bold" style={{ color: gradeColor(s.avg) }}>{formatGrade(s.avg, 1)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Letzte Noten</h3>
        <div className="space-y-1.5">
          {student.grades.slice(0, 15).map((g) => (
            <div key={g.id} className="flex items-center gap-3 rounded-lg border border-border/30 bg-bg-elevated px-3 py-2">
              <span className="text-lg font-bold w-8 text-center" style={{ color: gradeColor(g.value) }}>
                {formatGrade(g.value, 1)}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-foreground">{g.subject.name}</span>
                <span className="text-[11px] text-muted ml-2">{gradeTypeLabel(g.type)}</span>
              </div>
              <span className="text-[11px] text-muted">{new Date(g.date).toLocaleDateString("de-DE")}</span>
            </div>
          ))}
        </div>
      </div>

      {student.events.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Termine</h3>
          <div className="space-y-1.5">
            {student.events.map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-lg border border-border/30 bg-bg-elevated px-3 py-2">
                <Calendar className="h-3.5 w-3.5 text-muted shrink-0" />
                <span className="text-xs font-medium text-foreground">{e.title}</span>
                <Badge variant="default" className="shrink-0">{eventTypeLabel(e.type)}</Badge>
                <span className="text-[11px] text-muted ml-auto">{new Date(e.date).toLocaleDateString("de-DE")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href={`/admin/chat/${id}`}>
        <button className="w-full rounded-xl border border-accent/30 bg-accent/5 py-3 text-sm font-semibold text-accent hover:bg-accent/10 transition cursor-pointer">
          Chat mit {student.name} öffnen
        </button>
      </Link>
    </div>
  );
}
