import { prisma } from "@/lib/db";
import { createToken } from "@/lib/auth";
import { compareSync } from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !compareSync(password, user.passwordHash)) {
    return Response.json({ error: "Falscher Benutzername oder Passwort." }, { status: 401 });
  }

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

  return Response.json({ ok: true, role: user.role });
}
