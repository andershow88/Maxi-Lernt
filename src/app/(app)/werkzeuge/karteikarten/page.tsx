import { getDueFlashcards, getAllFlashcards } from "@/server/flashcard-actions";
import { listSubjects } from "@/server/subject-queries";
import { FlashcardView } from "@/components/werkzeuge/flashcard-view";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function KarteikartenPage() {
  const user = await requireUser();
  const [due, all, subjects] = await Promise.all([
    getDueFlashcards(),
    getAllFlashcards(),
    listSubjects(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/werkzeuge" className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Karteikarten" description={`${due.length} Karten fällig · ${all.length} gesamt`} />
      </div>
      <FlashcardView
        dueCards={due.map((c) => ({ id: c.id, front: c.front, back: c.back, level: c.level, subjectName: c.subject?.name ?? null }))}
        totalCount={all.length}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name, icon: s.icon, color: s.color }))}
      />
    </div>
  );
}
