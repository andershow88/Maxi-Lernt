"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Send, Loader2, Check, XCircle, Sparkles, Copy, CheckCheck } from "lucide-react";
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
  streaming?: boolean;
  copied?: boolean;
};

function Markdown({ text }: { text: string }) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-black/10 px-1 py-0.5 text-[12px]">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-3 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-3 list-decimal">$2</li>')
    .replace(/(<li.*<\/li>)/g, "$1")
    .replace(/\n/g, "<br />");

  return (
    <div
      className="prose-sm text-sm leading-relaxed [&_strong]:font-bold [&_li]:my-0.5 [&_code]:text-accent"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 mt-2 text-[10px] text-muted hover:text-foreground transition cursor-pointer"
    >
      {copied ? (
        <><CheckCheck className="h-3 w-3 text-success" /> Kopiert</>
      ) : (
        <><Copy className="h-3 w-3" /> Kopieren</>
      )}
    </button>
  );
}

function AIPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const streamResponse = useCallback(async (userMsg: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", text: data.error ?? "Fehler." }]);
        setLoading(false);
        return;
      }

      const contentType = res.headers.get("content-type") ?? "";

      // Non-streamed response (confirm actions)
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.error) {
          setMessages((prev) => [...prev, { role: "assistant", text: data.error }]);
        } else if (data.success) {
          setMessages((prev) => [...prev, { role: "assistant", text: data.message }]);
          router.refresh();
        }
        setLoading(false);
        return;
      }

      // SSE stream
      const reader = res.body?.getReader();
      if (!reader) {
        setMessages((prev) => [...prev, { role: "assistant", text: "Streaming nicht unterstützt." }]);
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let pendingAction: PendingAction | undefined;
      let buffer = "";
      let assistantIdx: number | null = null;

      // Add placeholder message
      setMessages((prev) => {
        assistantIdx = prev.length;
        return [...prev, { role: "assistant", text: "", streaming: true }];
      });

      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;

          try {
            const data = JSON.parse(payload);

            if (data.error) {
              fullText = `Fehler: ${data.error}`;
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === assistantIdx ? { ...m, text: fullText, streaming: false } : m,
                ),
              );
              continue;
            }

            if (data.pending_action) {
              pendingAction = { action: data.pending_action, data: data.pending_data };
              continue;
            }

            if (data.token) {
              fullText += data.token;
              const currentText = fullText;
              const currentPending = pendingAction;
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === assistantIdx
                    ? { ...m, text: currentText, pending: currentPending }
                    : m,
                ),
              );
            }
          } catch {}
        }
      }

      // Finalize
      const finalPending = pendingAction;
      setMessages((prev) =>
        prev.map((m, i) =>
          i === assistantIdx
            ? { ...m, streaming: false, pending: finalPending }
            : m,
        ),
      );
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Verbindungsfehler." }]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    await streamResponse(userMsg);
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

  return (
    <div className="fixed inset-0" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        className="absolute inset-x-0 top-0 bottom-0 sm:inset-auto sm:top-8 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl sm:max-h-[85dvh] sm:rounded-2xl flex flex-col border-0 sm:border border-border bg-bg-elevated shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 shrink-0">
          <Sparkles className="h-5 w-5 text-accent shrink-0" />
          <span className="text-base font-semibold text-foreground">KI-Assistent</span>
          <div className="flex-1" />
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface hover:text-foreground transition cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-10 space-y-4">
              <Sparkles className="mx-auto h-12 w-12 text-accent/30" />
              <p className="text-sm text-muted leading-relaxed px-4">
                Stell mir eine Frage, frag nach deinen Noten oder sag mir was ich anlegen soll.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {["Meine Mathe-Noten?", "Nächste Termine?", "Was ist Photosynthese?"].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setQuery(ex); inputRef.current?.focus(); }}
                    className="rounded-xl bg-surface border border-border/50 px-3.5 py-2 text-xs text-muted hover:text-foreground hover:border-accent/40 transition cursor-pointer"
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
                "max-w-[85%] rounded-2xl px-4 py-3",
                msg.role === "user"
                  ? "bg-accent text-white rounded-br-md"
                  : "bg-surface text-foreground rounded-bl-md",
              )}>
                {msg.role === "user" ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <>
                    {msg.text ? <Markdown text={msg.text} /> : null}
                    {msg.streaming && !msg.text && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted" />
                    )}
                    {msg.streaming && msg.text && (
                      <span className="inline-block w-1.5 h-4 bg-accent animate-pulse ml-0.5 align-text-bottom rounded-sm" />
                    )}
                  </>
                )}

                {msg.role === "assistant" && !msg.streaming && msg.text && !msg.pending && (
                  <CopyButton text={msg.text} />
                )}

                {msg.pending && !msg.streaming && msg.confirmed === undefined && (
                  <div className="flex gap-2 mt-3 pt-2.5 border-t border-border/30">
                    <button
                      onClick={() => handleConfirm(i, true)}
                      disabled={loading}
                      className="flex items-center gap-1.5 rounded-lg bg-success/15 px-4 py-2 text-xs font-semibold text-success hover:bg-success/25 transition cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" /> Ja, anlegen
                    </button>
                    <button
                      onClick={() => handleConfirm(i, false)}
                      disabled={loading}
                      className="flex items-center gap-1.5 rounded-lg bg-danger/15 px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/25 transition cursor-pointer"
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

          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-surface px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border/60 px-4 py-3 flex gap-2 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Frage oder Anweisung eingeben..."
            className="flex-1 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-white disabled:opacity-40 hover:bg-accent-2 transition cursor-pointer"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function AISearch() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-surface/80 border border-border/50 px-4 py-2 text-sm text-muted hover:text-foreground hover:border-accent/40 transition cursor-pointer"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Frag mich was...</span>
        <span className="sm:hidden">KI</span>
      </button>

      {open && mounted && createPortal(
        <AIPanel onClose={() => setOpen(false)} />,
        document.body,
      )}
    </>
  );
}
