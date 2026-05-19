import { ExplainForm } from "@/components/erklaerer/explain-form";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { History, ArrowLeft } from "lucide-react";

export default function ErklaererPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/werkzeuge" className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader
          title="Erklärer & Übersetzer"
          description="Gib einen Begriff ein — die KI erklärt oder übersetzt ihn."
          action={
            <Link href="/erklaerer/verlauf">
              <Button variant="secondary" size="sm">
                <History className="h-3.5 w-3.5" /> Verlauf
              </Button>
            </Link>
          }
        />
      </div>
      <ExplainForm />
    </div>
  );
}
