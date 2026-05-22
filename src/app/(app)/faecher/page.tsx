import { PageHeader } from "@/components/ui/page-header";
import { SubjectManager } from "@/components/noten/subject-manager";
import { listAllSubjects } from "@/server/subject-queries";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FaecherPage() {
  const user = await requireUser();
  const subjects = await listAllSubjects(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Fächer verwalten" description="Fächer hinzufügen, bearbeiten oder ausblenden" />
      </div>
      <SubjectManager subjects={subjects} />
    </div>
  );
}
