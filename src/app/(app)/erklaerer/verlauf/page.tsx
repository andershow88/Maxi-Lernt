import { ArrowLeft, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SavedTermsList } from "@/components/erklaerer/saved-terms-list";
import { listSavedTerms, getTermCategories } from "@/server/term-queries";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function VerlaufPage() {
  const user = await requireUser();
  const [terms, categories] = await Promise.all([
    listSavedTerms(user.id),
    getTermCategories(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/erklaerer"
          className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader
          title="Gespeicherte Begriffe"
          description={`${terms.length} Begriffe gespeichert`}
        />
      </div>

      {terms.length === 0 ? (
        <EmptyState
          icon={<BookOpenCheck className="h-6 w-6" />}
          title="Noch keine Begriffe"
          description="Suche einen Begriff und speichere ihn."
        />
      ) : (
        <SavedTermsList terms={terms} categories={categories} />
      )}
    </div>
  );
}
