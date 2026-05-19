"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createEventAction } from "@/server/event-actions";
import type { Subject } from "@prisma/client";

const EVENT_TYPES = [
  { value: "SCHULAUFGABE", label: "Schulaufgabe" },
  { value: "EX", label: "Ex" },
  { value: "TEST", label: "Test" },
  { value: "REFERAT", label: "Referat" },
  { value: "HAUSAUFGABE", label: "Hausaufgabe" },
  { value: "LERNTERMIN", label: "Lerntermin" },
  { value: "SONSTIGER", label: "Sonstiger Termin" },
];

export function EventForm({ subjects }: { subjects: Subject[] }) {
  const [saving, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
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
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Fach (optional)</label>
        <select
          name="subjectId"
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">Kein Fach</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
          <label className="block text-sm font-medium text-foreground mb-1.5">Uhrzeit</label>
          <input
            type="time"
            name="time"
            className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Art</label>
        <div className="grid grid-cols-2 gap-2">
          {EVENT_TYPES.map((t) => (
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
        <label className="block text-sm font-medium text-foreground mb-1.5">Notiz (optional)</label>
        <textarea
          name="note"
          rows={2}
          placeholder="Zusätzliche Infos..."
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-foreground placeholder:text-subtle resize-none focus:border-accent focus:outline-none"
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
              className="w-full rounded-xl border border-border bg-bg-elevated px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
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
              className="w-full rounded-xl border border-border bg-bg-elevated px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
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
