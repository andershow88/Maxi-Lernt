import { getStudyStats } from "@/server/study-session-actions";
import { StudyTimer } from "@/components/werkzeuge/study-timer";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LernzeitPage() {
  const stats = await getStudyStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/werkzeuge" className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Lernzeit" description="Tracke deine Lernzeit pro Fach." />
      </div>
      <StudyTimer stats={stats} />
    </div>
  );
}
