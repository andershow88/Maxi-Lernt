"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

type SubjectOption = { id: string; name: string; icon?: string; color?: string };

export function SubjectPicker({
  subjects,
  value,
  onChange,
  label = "Fach",
  placeholder = "Fach wählen...",
  allowEmpty = false,
  emptyLabel = "Kein Fach",
}: {
  subjects: SubjectOption[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = subjects.find((s) => s.id === value || s.name === value);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function getIcon(iconName?: string) {
    return (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName ?? "BookOpen"] ?? Icons.BookOpen;
  }

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-3 rounded-xl border bg-bg-elevated px-4 py-3 text-sm transition cursor-pointer",
          open ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40",
        )}
      >
        {selected ? (
          <>
            <div
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
              style={{ backgroundColor: `${selected.color ?? "#4f46e5"}18`, color: selected.color ?? "#4f46e5" }}
            >
              {(() => { const I = getIcon(selected.icon); return <I className="h-4 w-4" />; })()}
            </div>
            <span className="text-foreground font-medium">{selected.name}</span>
          </>
        ) : (
          <span className="text-subtle">{placeholder}</span>
        )}
        <ChevronDown className={cn("ml-auto h-4 w-4 text-muted transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-border bg-bg-elevated shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {allowEmpty && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition cursor-pointer",
                !value ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface",
              )}
            >
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface">
                <Icons.Minus className="h-4 w-4 text-muted" />
              </div>
              <span className="font-medium">{emptyLabel}</span>
              {!value && <Check className="ml-auto h-4 w-4" />}
            </button>
          )}
          {subjects.map((s) => {
            const I = getIcon(s.icon);
            const isSelected = s.id === value || s.name === value;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { onChange(s.id); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition cursor-pointer",
                  isSelected ? "bg-accent/10 text-accent" : "text-foreground hover:bg-surface",
                )}
              >
                <div
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: `${s.color ?? "#4f46e5"}18`, color: s.color ?? "#4f46e5" }}
                >
                  <I className="h-4 w-4" />
                </div>
                <span className="font-medium">{s.name}</span>
                {isSelected && <Check className="ml-auto h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
