import { prisma } from "@/lib/db";
import { createToken } from "@/lib/auth";
import { hashSync } from "bcryptjs";
import { cookies } from "next/headers";
import { DEFAULT_SUBJECTS } from "@/lib/subjects";

export async function POST(req: Request) {
  const { name, username, password, inviteCode } = await req.json();

  if (!name || !username || !password || !inviteCode) {
    return Response.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
  }

  if (username.length < 3) {
    return Response.json({ error: "Benutzername muss mindestens 3 Zeichen lang sein." }, { status: 400 });
  }

  if (password.length < 4) {
    return Response.json({ error: "Passwort muss mindestens 4 Zeichen lang sein." }, { status: 400 });
  }

  const invite = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
  if (!invite || !invite.active) {
    return Response.json({ error: "Ungültiger Einladungscode." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return Response.json({ error: "Benutzername ist bereits vergeben." }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      username,
      passwordHash: hashSync(password, 10),
      role: "SCHUELER",
      classCode: invite.className,
    },
  });

  // Create default subjects for new student
  for (const s of DEFAULT_SUBJECTS) {
    await prisma.subject.create({
      data: { name: s.name, icon: s.icon, color: s.color, order: s.order, userId: user.id },
    });
  }

  // Create default settings
  await prisma.settings.create({
    data: { userId: user.id, decimalPlaces: 1, sortOrder: "best", theme: "light" },
  });

  const token = await createToken({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });

  const jar = await cookies();
  jar.set("maxi-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return Response.json({ ok: true });
}
