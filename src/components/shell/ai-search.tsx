"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Check, XCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type PendingAction = {
  action: string;
  data: Record<string, unknown>;
};

type Message = {
  role: "user" | "assistant";
  text: string;
  pending?: PendingAction;
  confirmed?: boolean;
};

export function AISearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleClose() {
    setOpen(false);
    setQuery("");
    setMessages([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.error }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.reply,
            pending: data.pending_action
              ? { action: data.pending_action, data: data.pending_data }
              : undefined,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Verbindungsfehler." }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(msgIndex: number, confirmed: boolean) {
    const msg = messages[msgIndex];
    if (!msg?.pending) return;

    setMessages((prev) =>
      prev.map((m, i) => (i === msgIndex ? { ...m, confirmed } : m)),
    );

    if (!confirmed) {
      setMessages((prev) => [...prev, { role: "assistant", text: "OK, abgebrochen." }]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "bestätigt",
          confirm: msg.pending,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.message }]);
        router.refresh();
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: data.error ?? "Fehler." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Fehler beim Ausführen." }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl bg-surface/80 border border-border/50 px-3 py-1.5 text-xs text-muted hover:text-foreground hover:border-accent/40 transition cursor-pointer"
      >
        <Sparkles className="h-3 w-3" />
        <span className="hidden sm:inline">Frag mich was...</span>
        <span className="sm:hidden">KI</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop — nur dunkel, kein Blur */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Chat-Panel — volle Breite auf Mobile, zentriert auf Desktop */}
      <div
        className="relative mx-2 sm:mx-auto mt-3 sm:mt-12 w-auto sm:w-full sm:max-w-xl flex flex-col rounded-2xl border border-border bg-bg-elevated shadow-2xl overflow-hidden"
        style={{ maxHeight: "calc(100dvh - 24px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Sparkles className="h-4 w-4 text-accent shrink-0" />
          <span className="text-sm font-semibold text-foreground">KI-Assistent</span>
          <div className="flex-1" />
          <button onClick={handleClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface hover:text-foreground transition cursor-pointer">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[200px]">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <Sparkles className="mx-auto h-10 w-10 text-accent/30" />
              <p className="text-sm text-muted leading-relaxed px-4">
                Stell mir eine Frage, frag nach deinen Noten oder sag mir was ich anlegen soll.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {["Meine Mathe-Noten?", "Nächste Termine?", "Was ist Photosynthese?"].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setQuery(ex); inputRef.current?.focus(); }}
                    className="rounded-lg bg-surface border border-border/50 px-3 py-1.5 text-xs text-muted hover:text-foreground hover:border-accent/40 transition cursor-pointer"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-accent text-white rounded-br-md"
                  : "bg-surface text-foreground rounded-bl-md",
              )}>
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.pending && msg.confirmed === undefined && (
                  <div className="flex gap-2 mt-3 pt-2.5 border-t border-border/30">
                    <button
                      onClick={() => handleConfirm(i, true)}
                      disabled={loading}
                      className="flex items-center gap-1.5 rounded-lg bg-success/15 px-3.5 py-2 text-xs font-semibold text-success hover:bg-success/25 transition cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" /> Ja, anlegen
                    </button>
                    <button
                      onClick={() => handleConfirm(i, false)}
                      disabled={loading}
                      className="flex items-center gap-1.5 rounded-lg bg-danger/15 px-3.5 py-2 text-xs font-semibold text-danger hover:bg-danger/25 transition cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Nein
                    </button>
                  </div>
                )}

                {msg.confirmed === true && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-success">
                    <Check className="h-3 w-3" /> Bestätigt
                  </div>
                )}
                {msg.confirmed === false && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-danger">
                    <XCircle className="h-3 w-3" /> Abgebrochen
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-surface px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-border/60 px-3 py-3 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Frage oder Anweisung eingeben..."
            className="flex-1 rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-white disabled:opacity-40 hover:bg-accent-2 transition cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
