"use client";

import { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { updateDecimalPlaces, updateSortOrder } from "@/server/settings-actions";
import { cn } from "@/lib/utils";

const DECIMAL_OPTIONS = [
  { value: 0, label: "Ohne Komma", example: "2" },
  { value: 1, label: "1 Stelle", example: "2,3" },
  { value: 2, label: "2 Stellen", example: "2,33" },
];

const SORT_OPTIONS = [
  { value: "best", label: "Beste Note zuerst" },
  { value: "worst", label: "Schlechteste zuerst" },
  { value: "alpha", label: "Alphabetisch" },
  { value: "improvement", label: "Verbesserungsbedarf" },
];

type Settings = { decimalPlaces: number; sortOrder: string };

export function SettingsForm({ settings }: { settings: Settings }) {
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Notendarstellung</h3>
          <p className="text-xs text-muted">Wie viele Nachkommastellen sollen Noten haben?</p>
          <div className="grid grid-cols-3 gap-2">
            {DECIMAL_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => startTransition(() => { updateDecimalPlaces(o.value); })}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border py-3 text-sm transition cursor-pointer",
                  settings.decimalPlaces === o.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-bg-elevated text-muted hover:text-foreground",
                )}
              >
                <span className="text-lg font-bold">{o.example}</span>
                <span className="text-[10px]">{o.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Standard-Sortierung</h3>
          <div className="space-y-1.5">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => startTransition(() => { updateSortOrder(o.value); })}
                className={cn(
                  "flex items-center w-full rounded-xl border px-4 py-2.5 text-sm transition cursor-pointer",
                  settings.sortOrder === o.value
                    ? "border-accent bg-accent/10 text-accent font-medium"
                    : "border-border bg-bg-elevated text-muted hover:text-foreground",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Über die App</h3>
          <p className="text-xs text-muted">
            Maxi Lernt — Dein persönlicher Schulplaner und Lernassistent.
            Noten, Kalender, Scan und KI-Lerncoach in einer App.
          </p>
          <p className="text-[10px] text-subtle">
            Daten werden nur auf dem Server gespeichert. Keine persönlichen Informationen erforderlich.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
