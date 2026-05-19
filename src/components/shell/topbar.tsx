"use client";

import Link from "next/link";
import { GraduationCap, Settings, Brain, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AISearch } from "./ai-search";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg-elevated/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-white">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Maxi Lernt
          </span>
        </Link>
        <div className="flex-1 flex justify-center px-3">
          <AISearch />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/lerncoach"
            className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition"
            title="KI-Lerncoach"
          >
            <Brain className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="/faecher"
            className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition"
            title="Fächer verwalten"
          >
            <BookOpen className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="/einstellungen"
            className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition"
            title="Einstellungen"
          >
            <Settings className="h-4.5 w-4.5" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
