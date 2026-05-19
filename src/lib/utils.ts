import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function gradeColor(value: number): string {
  if (value <= 1.5) return "var(--grade-1)";
  if (value <= 2.5) return "var(--grade-2)";
  if (value <= 3.5) return "var(--grade-3)";
  if (value <= 4.5) return "var(--grade-4)";
  if (value <= 5.5) return "var(--grade-5)";
  return "var(--grade-6)";
}

export function gradeColorClass(value: number): string {
  if (value <= 1.5) return "text-grade-1";
  if (value <= 2.5) return "text-grade-2";
  if (value <= 3.5) return "text-grade-3";
  if (value <= 4.5) return "text-grade-4";
  if (value <= 5.5) return "text-grade-5";
  return "text-grade-6";
}

export function gradeBgClass(value: number): string {
  if (value <= 1.5) return "bg-grade-1";
  if (value <= 2.5) return "bg-grade-2";
  if (value <= 3.5) return "bg-grade-3";
  if (value <= 4.5) return "bg-grade-4";
  if (value <= 5.5) return "bg-grade-5";
  return "bg-grade-6";
}

export function formatGrade(value: number, decimals: number): string {
  return value.toFixed(decimals).replace(".", ",");
}

export function gradeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    SCHULAUFGABE: "Schulaufgabe",
    EX: "Ex",
    MUENDLICH: "Mündlich",
    SONSTIGE: "Sonstige",
  };
  return labels[type] ?? type;
}

export function weightLabel(weight: number): string {
  if (weight === 0.5) return "0,5×";
  if (weight === 1) return "1×";
  if (weight === 2) return "2×";
  return `${weight}×`;
}

export function eventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    SCHULAUFGABE: "Schulaufgabe",
    EX: "Ex",
    TEST: "Test",
    REFERAT: "Referat",
    HAUSAUFGABE: "Hausaufgabe",
    LERNTERMIN: "Lerntermin",
    SONSTIGER: "Sonstiger Termin",
  };
  return labels[type] ?? type;
}
