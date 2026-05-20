"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Users, Ticket, Plus, Trash2, MessageCircle, BarChart3, Calendar, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { createInviteCode, deleteInviteCode } from "@/server/admin-actions";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  name: string;
  username: string;
  classCode: string | null;
  gradeCount: number;
  eventCount: number;
  flashcardCount: number;
  overallAvg: number | null;
};

type InviteCode = {
  id: string;
  code: string;
  className: string;
  active: boolean;
};

function gradeColor(avg: number) {
  if (avg <= 1.5) return "text-green-500";
  if (avg <= 2.5) return "text-green-400";
  if (avg <= 3.5) return "text-amber-500";
  if (avg <= 4.5) return "text-orange-500";
  return "text-red-500";
}

export function AdminDashboard({ students, inviteCodes }: { students: Student[]; inviteCodes: InviteCode[] }) {
  const [tab, setTab] = useState<"schueler" | "codes">("schueler");
  const [newCode, setNewCode] = useState("");
  const [newClass, setNewClass] = useState("");
  const [saving, startTransition] = useTransition();
  const router = useRouter();

  function handleCreateCode() {
    if (!newCode.trim() || !newClass.trim()) return;
    startTransition(async () => {
      await createInviteCode(newCode.trim(), newClass.trim());
      setNewCode("");
      setNewClass("");
      router.refresh();
    });
  }

  function handleDeleteCode(id: string) {
    startTransition(async () => {
      await deleteInviteCode(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Admin-Bereich" description={`${students.length} Schüler registriert`} />

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setTab("schueler")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition cursor-pointer",
            tab === "schueler" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted",
          )}
        >
          <Users className="h-4 w-4" /> Schüler
        </button>
        <button
          onClick={() => setTab("codes")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition cursor-pointer",
            tab === "codes" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted",
          )}
        >
          <Ticket className="h-4 w-4" /> Einladungscodes
        </button>
      </div>

      {tab === "schueler" && (
        <div className="space-y-2">
          {students.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted">
                Noch keine Schüler registriert. Erstelle einen Einladungscode.
              </CardContent>
            </Card>
          ) : (
            students.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                      <p className="text-[11px] text-muted">@{s.username} · Klasse {s.classCode ?? "–"}</p>
                    </div>
                    {s.overallAvg !== null && (
                      <span className={cn("text-xl font-bold", gradeColor(s.overallAvg))}>
                        {s.overallAvg.toFixed(1).replace(".", ",")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
                    <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> {s.gradeCount} Noten</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {s.eventCount} Termine</span>
                    <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {s.flashcardCount} Karten</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href={`/admin/schueler/${s.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        <BarChart3 className="h-3.5 w-3.5" /> Details
                      </Button>
                    </Link>
                    <Link href={`/admin/chat/${s.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        <MessageCircle className="h-3.5 w-3.5" /> Chat
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "codes" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Neuer Einladungscode</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Code z.B. 9B-2026"
                  className="rounded-xl border border-border bg-bg-elevated px-3 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                />
                <input
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  placeholder="Klasse z.B. 9B"
                  className="rounded-xl border border-border bg-bg-elevated px-3 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                />
              </div>
              <Button onClick={handleCreateCode} disabled={!newCode.trim() || !newClass.trim() || saving} size="sm" className="w-full">
                <Plus className="h-3.5 w-3.5" /> Code erstellen
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {inviteCodes.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-bg-elevated px-4 py-3">
                <div>
                  <span className="text-sm font-mono font-bold text-accent">{c.code}</span>
                  <span className="text-xs text-muted ml-2">Klasse {c.className}</span>
                </div>
                <button
                  onClick={() => handleDeleteCode(c.id)}
                  disabled={saving}
                  className="text-muted hover:text-red-500 transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
