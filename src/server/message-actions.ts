"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getConversation(otherUserId: string) {
  const user = await requireUser();

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, role: true } },
    },
  });

  // Mark unread messages as read
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: user.id,
      read: false,
    },
    data: { read: true },
  });

  return messages;
}

export async function sendMessage(receiverId: string, text: string) {
  const user = await requireUser();
  if (!text.trim()) return { ok: false };

  await prisma.message.create({
    data: { senderId: user.id, receiverId, text: text.trim() },
  });

  revalidatePath("/admin");
  revalidatePath("/nachrichten");
  return { ok: true };
}

export async function getChatList() {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    const students = await prisma.user.findMany({
      where: { role: "SCHUELER" },
      orderBy: { name: "asc" },
    });

    const unreadCounts = await prisma.message.groupBy({
      by: ["senderId"],
      where: { receiverId: user.id, read: false },
      _count: true,
    });

    const lastMessages = await Promise.all(
      students.map(async (s) => {
        const last = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: user.id, receiverId: s.id },
              { senderId: s.id, receiverId: user.id },
            ],
          },
          orderBy: { createdAt: "desc" },
        });
        return { studentId: s.id, last };
      }),
    );

    return students.map((s) => ({
      id: s.id,
      name: s.name,
      classCode: s.classCode,
      unread: unreadCounts.find((u) => u.senderId === s.id)?._count ?? 0,
      lastMessage: lastMessages.find((l) => l.studentId === s.id)?.last?.text ?? null,
      lastAt: lastMessages.find((l) => l.studentId === s.id)?.last?.createdAt ?? null,
    }));
  }

  // Student: find admin
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) return [];

  const unread = await prisma.message.count({
    where: { senderId: admin.id, receiverId: user.id, read: false },
  });

  const last = await prisma.message.findFirst({
    where: {
      OR: [
        { senderId: user.id, receiverId: admin.id },
        { senderId: admin.id, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return [{
    id: admin.id,
    name: admin.name,
    classCode: null,
    unread,
    lastMessage: last?.text ?? null,
    lastAt: last?.createdAt ?? null,
  }];
}
