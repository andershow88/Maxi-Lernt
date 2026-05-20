import { redirect, notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getConversation } from "@/server/message-actions";
import { prisma } from "@/lib/db";
import { ChatView } from "@/components/chat/chat-view";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminChatPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin().catch(() => redirect("/login"));
  const { id } = await params;

  const student = await prisma.user.findUnique({ where: { id, role: "SCHUELER" } });
  if (!student) notFound();

  const messages = await getConversation(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title={`Chat mit ${student.name}`} description={`@${student.username} · Klasse ${student.classCode ?? "–"}`} />
      </div>
      <ChatView
        messages={messages.map((m) => ({
          id: m.id,
          text: m.text,
          read: m.read,
          createdAt: m.createdAt.toISOString(),
          sender: m.sender,
        }))}
        currentUserId={admin.id}
        otherUserId={id}
        otherUserName={student.name}
      />
    </div>
  );
}
