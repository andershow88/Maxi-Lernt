import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { GradeForm } from "@/components/noten/grade-form";
import { listSubjects } from "@/server/subject-queries";
import { getGrade } from "@/server/grade-queries";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [grade, subjects] = await Promise.all([
    getGrade(user.id, id),
    listSubjects(user.id),
  ]);

  if (!grade) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Note bearbeiten" description="Ändere die Note oder lösche sie" />
      </div>
      <GradeForm subjects={subjects} grade={grade} />
    </div>
  );
}
