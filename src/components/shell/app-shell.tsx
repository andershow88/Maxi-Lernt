import type { ReactNode } from "react";
import { Topbar } from "./topbar";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children, role }: { children: ReactNode; role: string }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Topbar role={role} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav role={role} />
    </div>
  );
}
