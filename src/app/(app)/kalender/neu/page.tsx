import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { EventForm } from "@/components/kalender/event-form";
import { listSubjects } from "@/server/subject-queries";

export const dynamic = "force-dynamic";

export default async function NeuerTerminPage() {
  const subjects = await listSubjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/kalender"
          className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Neuer Termin" description="Schulaufgabe, Ex, Lerntermin..." />
      </div>
      <EventForm subjects={subjects} />
    </div>
  );
}
