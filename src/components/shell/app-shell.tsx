import type { ReactNode } from "react";
import { Topbar } from "./topbar";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Topbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
