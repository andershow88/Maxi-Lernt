"use client";

import { useState } from "react";
import { Sparkles, Loader2, Brain, ClipboardCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LessonDisplay } from "./lesson-display";
import { QuizCard } from "./quiz-card";

type SubjectOption = { id: string; name: string };

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

export function CoachForm({ subjects }: { subjects: SubjectOption[] }) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<"idle" | "lesson" | "quiz">("idle");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startLearn() {
    if (!subject || !topic.trim()) return;
    setLoading(true);
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
    }
  }

  async function startQuiz() {
    if (!subject || !topic.trim()) return;
    setLoading(true);
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Fach</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              <option value="">Fach wählen...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

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
