import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { GradeForm } from "@/components/noten/grade-form";
import { listSubjects } from "@/server/subject-queries";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NeueNotePage({
  searchParams,
}: {
  searchParams: Promise<{ fach?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const subjects = await listSubjects(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Neue Note" description="Trage eine Note ein" />
      </div>
      <GradeForm subjects={subjects} defaultSubjectId={params.fach} />
    </div>
  );
}
