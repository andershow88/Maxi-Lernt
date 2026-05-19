import { Lightbulb } from "lucide-react";

export function ImprovementHint({
  hint,
}: {
  hint: { targetGrade: number; neededGrade: number; message: string };
}) {
  return (
    <div className="flex items-start gap-2 px-4 py-2.5 bg-accent/5 border-t border-border/40">
      <Lightbulb className="h-3.5 w-3.5 shrink-0 text-accent mt-0.5" />
      <p className="text-[11px] text-muted leading-relaxed">{hint.message}</p>
    </div>
  );
}
