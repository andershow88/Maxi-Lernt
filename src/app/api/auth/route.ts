import { SignJWT } from "jose";
import { cookies } from "next/headers";

const USERNAME = "maxi";
const PASSWORD = "m_a_x_i!";
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "maxi-lernt-secret-key-2026");

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username !== USERNAME || password !== PASSWORD) {
    return Response.json({ error: "Falscher Benutzername oder Passwort." }, { status: 401 });
  }

  const token = await new SignJWT({ user: USERNAME })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);

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
