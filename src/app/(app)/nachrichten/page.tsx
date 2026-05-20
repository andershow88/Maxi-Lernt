import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getConversation } from "@/server/message-actions";
import { prisma } from "@/lib/db";
import { ChatView } from "@/components/chat/chat-view";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function NachrichtenPage() {
  const user = await requireUser().catch(() => redirect("/login"));

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    return (
      <div className="space-y-4">
        <PageHeader title="Nachrichten" description="Kein Lehrer verfügbar." />
      </div>
    );
  }

  const messages = await getConversation(admin.id);

  return (
    <div className="space-y-4">
      <PageHeader title="Nachrichten" description={`Chat mit ${admin.name}`} />
      <ChatView
        messages={messages.map((m) => ({
          id: m.id,
          text: m.text,
          read: m.read,
          createdAt: m.createdAt.toISOString(),
          sender: m.sender,
        }))}
        currentUserId={user.id}
        otherUserId={admin.id}
        otherUserName={admin.name}
      />
    </div>
  );
}
