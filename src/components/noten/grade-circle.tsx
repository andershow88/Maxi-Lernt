"use client";

import { gradeColor, formatGrade } from "@/lib/utils";

export function GradeCircle({
  value,
  decimals,
  size = "lg",
  label,
}: {
  value: number | null;
  decimals: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const dims = { sm: "h-10 w-10 text-sm", md: "h-14 w-14 text-lg", lg: "h-24 w-24 text-3xl" };
  const color = value !== null ? gradeColor(value) : "var(--muted)";
  const display = value !== null ? formatGrade(value, decimals) : "–";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${dims[size]} grid place-items-center rounded-full font-bold ring-2 transition-all`}
        style={{ color, borderColor: color, outlineColor: `${color}33` } as React.CSSProperties}
      >
        {display}
      </div>
      {label && <span className="text-[10px] font-medium text-muted">{label}</span>}
    </div>
  );
}
