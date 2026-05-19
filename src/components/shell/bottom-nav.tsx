"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calendar, ScanText, BookOpenCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Noten", icon: BarChart3 },
  { href: "/kalender", label: "Kalender", icon: Calendar },
  { href: "/scan", label: "Scan", icon: ScanText },
  { href: "/erklaerer", label: "Erklärer", icon: BookOpenCheck },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-bg-elevated/90 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-3xl items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-accent" : "text-muted hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
