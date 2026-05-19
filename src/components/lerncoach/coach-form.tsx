"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, Brain, ClipboardCheck, RotateCcw, ChevronDown, Check } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LessonDisplay } from "./lesson-display";
import { QuizCard } from "./quiz-card";
import { cn } from "@/lib/utils";

type SubjectOption = { id: string; name: string; icon?: string; color?: string };

type Lesson = {
  title: string;
  explanation: string;
  steps?: string[];
  example?: string;
  tip?: string;
  next_suggestion?: string;
};

type Quiz = {
  title: string;
  questions: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
};

function SubjectPicker({ subjects, value, onChange }: { subjects: SubjectOption[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = subjects.find((s) => s.name === value);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function getIcon(iconName?: string) {
    const Comp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName ?? "BookOpen"] ?? Icons.BookOpen;
    return Comp;
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-foreground mb-1.5">Fach</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-3 rounded-xl border bg-bg-elevated px-4 py-3 text-sm transition cursor-pointer",
          open ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40",
        )}
      >
        {selected ? (
          <>
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${selected.color ?? '#4f46e5'}18`, color: selected.color ?? '#4f46e5' }}>
              {(() => { const I = getIcon(selected.icon); return <I className="h-4 w-4" />; })()}
            </div>
            <span className="text-foreground font-medium">{selected.name}</span>
          </>
        ) : (
          <span className="text-subtle">Fach wählen...</span>
        )}
        <ChevronDown className={cn("ml-auto h-4 w-4 text-muted transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-border bg-bg-elevated shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {subjects.map((s) => {
            const I = getIcon(s.icon);
            const isSelected = s.name === value;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { onChange(s.name); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition cursor-pointer",
                  isSelected ? "bg-accent/10 text-accent" : "text-foreground hover:bg-surface",
                )}
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${s.color ?? '#4f46e5'}18`, color: s.color ?? '#4f46e5' }}>
                  <I className="h-4 w-4" />
                </div>
                <span className="font-medium">{s.name}</span>
                {isSelected && <Check className="ml-auto h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CoachForm({ subjects }: { subjects: SubjectOption[] }) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<"idle" | "lesson" | "quiz">("idle");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"learn" | "quiz" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startLearn() {
    if (!subject || !topic.trim()) return;
    setLoading(true);
    setLoadingType("learn");
    setError(null);
    setLesson(null);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic: topic.trim(), mode: "learn" }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setLesson(data);
        setMode("lesson");
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  }

  async function startQuiz() {
    if (!subject || !topic.trim()) return;
    setLoading(true);
    setLoadingType("quiz");
    setError(null);
    setQuiz(null);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic: topic.trim(), mode: "quiz" }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setQuiz(data);
        setMode("quiz");
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  }

  function reset() {
    setMode("idle");
    setLesson(null);
    setQuiz(null);
    setError(null);
  }

  const subjectName = subjects.find((s) => s.id === subject)?.name ?? subject;

  return (
    <div className="space-y-4">
      {mode === "idle" && (
        <>
          <SubjectPicker subjects={subjects} value={subject} onChange={setSubject} />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Was möchtest du lernen oder besser verstehen?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="z. B. Lineare Funktionen, Atombindungen, Weimarer Republik..."
              className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-foreground placeholder:text-subtle resize-none focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={startLearn} disabled={!subject || !topic.trim() || loading} className="w-full">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><Brain className="h-4 w-4" /> Lernen</>
              )}
            </Button>
            <Button variant="secondary" onClick={startQuiz} disabled={!subject || !topic.trim() || loading} className="w-full">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><ClipboardCheck className="h-4 w-4" /> Quiz</>
              )}
            </Button>
          </div>

          <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Beispiele</span>
            </div>
            <ul className="text-xs text-muted space-y-1.5">
              <li>&quot;Ich verstehe lineare Funktionen nicht.&quot;</li>
              <li>&quot;Ich muss für Chemie Atombindungen lernen.&quot;</li>
              <li>&quot;Ich will englische Zeiten üben.&quot;</li>
              <li>&quot;Ich habe bald eine Schulaufgabe in Geschichte zur Weimarer Republik.&quot;</li>
            </ul>
          </div>
        </>
      )}

      {loading && loadingType && (
        <Card>
          <CardContent className="p-8 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-border" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-accent animate-spin" />
              <div className="absolute inset-0 grid place-items-center">
                {loadingType === "quiz" ? (
                  <ClipboardCheck className="h-6 w-6 text-accent" />
                ) : (
                  <Brain className="h-6 w-6 text-accent" />
                )}
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {loadingType === "quiz" ? "Quiz wird erstellt..." : "Lerneinheit wird vorbereitet..."}
              </p>
              <p className="text-xs text-muted">
                {loadingType === "quiz"
                  ? "Die KI formuliert Fragen und Antworten zu deinem Thema."
                  : "Die KI bereitet eine Erklärung speziell für dich vor."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="p-4 text-sm text-danger">{error}</CardContent>
        </Card>
      )}

      {mode === "lesson" && lesson && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">{lesson.title}</h2>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" /> Neu
            </Button>
          </div>
          <LessonDisplay lesson={lesson} />
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={startQuiz} disabled={loading}>
              <ClipboardCheck className="h-4 w-4" /> Quiz starten
            </Button>
            <Button variant="ghost" onClick={reset}>Neues Thema</Button>
          </div>
        </div>
      )}

      {mode === "quiz" && quiz && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">{quiz.title}</h2>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" /> Neu
            </Button>
          </div>
          <QuizCard quiz={quiz} subject={subjectName} topic={topic} />
        </div>
      )}
    </div>
  );
}
