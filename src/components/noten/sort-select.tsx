"use client";

import { useTransition } from "react";
import { ArrowUpDown } from "lucide-react";
import { updateSortOrder } from "@/server/settings-actions";

const OPTIONS = [
  { value: "best", label: "Beste zuerst" },
  { value: "worst", label: "Schlechteste zuerst" },
  { value: "alpha", label: "Alphabetisch" },
  { value: "improvement", label: "Verbesserungsbedarf" },
];

export function SortSelect({ current }: { current: string }) {
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-3.5 w-3.5 text-muted" />
      <select
        defaultValue={current}
        onChange={(e) => startTransition(() => { updateSortOrder(e.target.value); })}
        className="bg-transparent text-xs font-medium text-muted border-none focus:outline-none cursor-pointer"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
