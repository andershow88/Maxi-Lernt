import { cookies } from "next/headers";

export async function POST() {
  const jar = await cookies();
  jar.delete("maxi-token");
  return Response.json({ ok: true });
}
