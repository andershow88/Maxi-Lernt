import { Sparkles } from "lucide-react";

export function MotivationHint({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/5 border-t border-border/40">
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
      <p className="text-[11px] text-muted leading-relaxed">{message}</p>
    </div>
  );
}
