"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createGradeAction } from "@/server/grade-actions";
import type { Subject } from "@prisma/client";

const GRADE_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];
const WEIGHT_OPTIONS = [
  { value: 0.5, label: "0,5-fach" },
  { value: 1, label: "1-fach" },
  { value: 2, label: "2-fach" },
];
const TYPE_OPTIONS = [
  { value: "SCHULAUFGABE", label: "Schulaufgabe" },
  { value: "EX", label: "Ex" },
  { value: "MUENDLICH", label: "Mündliche Note" },
  { value: "SONSTIGE", label: "Sonstige Note" },
];

export function GradeForm({
  subjects,
  defaultSubjectId,
}: {
  subjects: Subject[];
  defaultSubjectId?: string;
}) {
  const [saving, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createGradeAction(formData);
      if (result.ok) router.push("/");
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Fach</label>
        <select
          name="subjectId"
          defaultValue={defaultSubjectId}
          required
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">Fach wählen...</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Note</label>
        <div className="grid grid-cols-6 gap-2">
          {GRADE_OPTIONS.map((g) => (
            <label key={g} className="relative">
              <input type="radio" name="value" value={g} required className="peer sr-only" />
              <div className="grid place-items-center rounded-xl border border-border bg-bg-elevated py-2.5 text-sm font-semibold cursor-pointer peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent transition">
                {String(g).replace(".", ",")}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Gewichtung</label>
        <div className="grid grid-cols-3 gap-2">
          {WEIGHT_OPTIONS.map((w) => (
            <label key={w.value} className="relative">
              <input
                type="radio"
                name="weight"
                value={w.value}
                defaultChecked={w.value === 1}
                className="peer sr-only"
              />
              <div className="grid place-items-center rounded-xl border border-border bg-bg-elevated py-2.5 text-sm font-medium cursor-pointer peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent transition">
                {w.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Art der Note</label>
        <div className="grid grid-cols-2 gap-2">
          {TYPE_OPTIONS.map((t) => (
            <label key={t.value} className="relative">
              <input type="radio" name="type" value={t.value} required className="peer sr-only" />
              <div className="grid place-items-center rounded-xl border border-border bg-bg-elevated py-2.5 text-sm font-medium cursor-pointer peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent transition">
                {t.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Datum</label>
        <input
          type="date"
          name="date"
          defaultValue={today}
          required
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Notiz (optional)</label>
        <textarea
          name="note"
          rows={2}
          placeholder="z. B. Kapitel 5, Thema Gleichungen..."
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-foreground placeholder:text-subtle resize-none focus:border-accent focus:outline-none"
        />
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Wird gespeichert..." : "Note speichern"}
      </Button>
    </form>
  );
}
