import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "maxi-lernt-secret-key-2026");

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "SCHUELER";
};

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get("maxi-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requireUserForAction(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export async function requireAdminForAction(): Promise<SessionUser> {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Not authorized");
  return user;
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ id: user.id, username: user.username, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);
}
