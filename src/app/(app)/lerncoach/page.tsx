import { CoachForm } from "@/components/lerncoach/coach-form";
import { PageHeader } from "@/components/ui/page-header";
import { listSubjects } from "@/server/subject-queries";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LerncoachPage() {
  const user = await requireUser();
  const subjects = await listSubjects(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="KI-Lerncoach"
        description="Wähle ein Fach und Thema — dein persönlicher Lernassistent hilft dir."
      />
      <CoachForm subjects={subjects.map((s) => ({ id: s.id, name: s.name, icon: s.icon, color: s.color }))} />
    </div>
  );
}
