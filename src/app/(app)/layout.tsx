import { AppShell } from "@/components/shell/app-shell";
import { getSession } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return <AppShell role={session?.role ?? "SCHUELER"}>{children}</AppShell>;
}
