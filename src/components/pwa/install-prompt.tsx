"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("maxi-install-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  }

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("maxi-install-dismissed", "1");
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-fade-in">
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-bg-elevated p-4 shadow-lg">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">App installieren</p>
          <p className="text-xs text-muted">Für schnellen Zugriff auf dem Homescreen</p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={install}>Installieren</Button>
          <button onClick={dismiss} className="p-1.5 text-muted hover:text-foreground cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
