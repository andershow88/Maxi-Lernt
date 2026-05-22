"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Check, CheckCheck } from "lucide-react";
import { sendMessage } from "@/server/message-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type MessageData = {
  id: string;
  text: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; name: string; role: string };
};

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function ChatView({
  messages,
  currentUserId,
  otherUserId,
  otherUserName,
}: {
  messages: MessageData[];
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
}) {
  const [text, setText] = useState("");
  const [sending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const msg = text.trim();
    setText("");
    startTransition(async () => {
      await sendMessage(otherUserId, msg);
      router.refresh();
    });
  }

  let lastDate = "";

  return (
    <div className="flex flex-col h-[calc(100dvh-200px)] min-h-[300px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-1 py-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-10 text-sm text-muted">
            Noch keine Nachrichten. Schreib die erste!
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender.id === currentUserId;
          const msgDate = formatDate(msg.createdAt);
          let showDate = false;
          if (msgDate !== lastDate) {
            showDate = true;
            lastDate = msgDate;
          }

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center my-3">
                  <span className="text-[10px] text-muted bg-surface px-3 py-1 rounded-full">{msgDate}</span>
                </div>
              )}
              <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5",
                  isMine
                    ? "bg-accent text-white rounded-br-md"
                    : "bg-surface text-foreground rounded-bl-md border border-border/30",
                )}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <div className={cn("flex items-center gap-1 mt-1", isMine ? "justify-end" : "justify-start")}>
                    <span className={cn("text-[10px]", isMine ? "text-white/60" : "text-muted")}>{formatTime(msg.createdAt)}</span>
                    {isMine && (
                      msg.read
                        ? <CheckCheck className="h-3 w-3 text-white/60" />
                        : <Check className="h-3 w-3 text-white/40" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-border/40">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Nachricht an ${otherUserName}...`}
          className="flex-1 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-white disabled:opacity-40 hover:bg-accent-2 transition cursor-pointer"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
