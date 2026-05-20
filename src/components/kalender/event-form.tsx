"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SubjectPicker } from "@/components/ui/subject-picker";
import { createEventAction } from "@/server/event-actions";
import { cn } from "@/lib/utils";
import type { Subject } from "@prisma/client";

const EVENT_TYPES = [
  { value: "SCHULAUFGABE", label: "Schulaufgabe", color: "border-red-500/30 bg-red-500/10 text-red-500 peer-checked:border-red-500/60 peer-checked:bg-red-500/15" },
  { value: "EX", label: "Ex", color: "border-amber-500/30 bg-amber-500/10 text-amber-500 peer-checked:border-amber-500/60 peer-checked:bg-amber-500/15" },
  { value: "TEST", label: "Test", color: "border-orange-500/30 bg-orange-500/10 text-orange-500 peer-checked:border-orange-500/60 peer-checked:bg-orange-500/15" },
  { value: "REFERAT", label: "Referat", color: "border-purple-500/30 bg-purple-500/10 text-purple-500 peer-checked:border-purple-500/60 peer-checked:bg-purple-500/15" },
  { value: "HAUSAUFGABE", label: "Hausaufgabe", color: "border-blue-500/30 bg-blue-500/10 text-blue-500 peer-checked:border-blue-500/60 peer-checked:bg-blue-500/15" },
  { value: "LERNTERMIN", label: "Lerntermin", color: "border-green-500/30 bg-green-500/10 text-green-500 peer-checked:border-green-500/60 peer-checked:bg-green-500/15" },
  { value: "SONSTIGER", label: "Sonstiger", color: "border-slate-500/30 bg-slate-500/10 text-slate-400 peer-checked:border-slate-500/60 peer-checked:bg-slate-500/15" },
];

export function EventForm({ subjects }: { subjects: Subject[] }) {
  const [saving, startTransition] = useTransition();
  const [subjectId, setSubjectId] = useState("");
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    formData.set("subjectId", subjectId);
    startTransition(async () => {
      const result = await createEventAction(formData);
      if (result.ok) router.push("/kalender");
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Titel</label>
        <input
          name="title"
          required
          placeholder="z. B. Mathe-Schulaufgabe Kapitel 5"
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
        />
      </div>

      <SubjectPicker
        subjects={subjects.map((s) => ({ id: s.id, name: s.name, icon: s.icon, color: s.color }))}
        value={subjectId}
        onChange={setSubjectId}
        label="Fach (optional)"
        placeholder="Kein Fach gewählt"
        allowEmpty
        emptyLabel="Kein Fach"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Datum</label>
          <input
            type="date"
            name="date"
            defaultValue={today}
            required
            className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base sm:text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Uhrzeit</label>
          <input
            type="time"
            name="time"
            className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base sm:text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Art</label>
        <div className="grid grid-cols-2 gap-2">
          {EVENT_TYPES.map((t) => (
            <label key={t.value} className="relative">
              <input type="radio" name="type" value={t.value} required className="peer sr-only" />
              <div className={cn(
                "grid place-items-center rounded-xl border py-2.5 text-sm font-medium cursor-pointer transition",
                t.color,
              )}>
                {t.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Notiz (optional)</label>
        <textarea
          name="note"
          rows={2}
          placeholder="Zusätzliche Infos..."
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle resize-none focus:border-accent focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-border/60 bg-surface/30 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Lernplanung (optional)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Lernen ab</label>
            <input
              type="date"
              name="studyStartDate"
              className="w-full rounded-xl border border-border bg-bg-elevated px-3 py-2.5 text-base sm:text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Min./Tag</label>
            <input
              type="number"
              name="studyMinutesPerDay"
              min={0}
              step={5}
              placeholder="30"
              className="w-full rounded-xl border border-border bg-bg-elevated px-3 py-2.5 text-base sm:text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
            />
          </div>
        </div>
        <p className="text-[11px] text-subtle">
          Wenn du ein Startdatum angibst, erstellt die App Lerntage bis zum Prüfungstag.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Wird gespeichert..." : "Termin speichern"}
      </Button>
    </form>
  );
}
