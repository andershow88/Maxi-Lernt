"use client";

import { useState } from "react";
import { Check, X, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Quiz = {
  title: string;
  questions: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
};

export function QuizCard({ quiz, subject, topic }: { quiz: Quiz; subject: string; topic: string }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null));
  const [revealed, setRevealed] = useState<boolean[]>(new Array(quiz.questions.length).fill(false));
  const [done, setDone] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const q = quiz.questions[currentQ];
  const selected = answers[currentQ];
  const isRevealed = revealed[currentQ];
  const isCorrect = selected === q?.correct;

  function selectAnswer(idx: number) {
    if (isRevealed) return;
    const next = [...answers];
    next[currentQ] = idx;
    setAnswers(next);
  }

  function reveal() {
    const next = [...revealed];
    next[currentQ] = true;
    setRevealed(next);
  }

  function next() {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      finish();
    }
  }

  async function finish() {
    setDone(true);
    setEvaluating(true);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          mode: "evaluate",
          questions: quiz.questions.map((q) => q.question),
          answers: answers.map((a, i) => (a !== null ? quiz.questions[i].options[a] : "Keine Antwort")),
        }),
      });

      const data = await res.json();
      if (data.feedback) {
        setFeedback(data.feedback);
      }
    } catch {
      setFeedback(null);
    } finally {
      setEvaluating(false);
    }
  }

  const correctCount = answers.reduce<number>(
    (sum, a, i) => sum + (a === quiz.questions[i].correct ? 1 : 0),
    0,
  );

  if (done) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <Trophy className="mx-auto h-10 w-10 text-warning" />
          <h3 className="text-xl font-bold text-foreground">Quiz fertig!</h3>
          <p className="text-2xl font-bold" style={{ color: correctCount >= quiz.questions.length / 2 ? "var(--success)" : "var(--danger)" }}>
            {correctCount} / {quiz.questions.length} richtig
          </p>
          {evaluating && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Feedback wird erstellt...
            </div>
          )}
          {feedback && (
            <p className="text-sm text-muted text-left leading-relaxed">{feedback}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!q) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">
          Frage {currentQ + 1} von {quiz.questions.length}
        </span>
        <div className="flex gap-1">
          {quiz.questions.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-6 rounded-full transition",
                i === currentQ ? "bg-accent" : i < currentQ ? (answers[i] === quiz.questions[i].correct ? "bg-success" : "bg-danger") : "bg-border",
              )}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground leading-relaxed">{q.question}</h3>

          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrectOpt = i === q.correct;

              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  disabled={isRevealed}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-sm text-left transition cursor-pointer",
                    isRevealed && isCorrectOpt && "border-success bg-success/10 text-success",
                    isRevealed && isSelected && !isCorrectOpt && "border-danger bg-danger/10 text-danger",
                    !isRevealed && isSelected && "border-accent bg-accent/10 text-accent",
                    !isRevealed && !isSelected && "border-border bg-bg-elevated text-foreground hover:border-accent/40",
                  )}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold">
                    {isRevealed && isCorrectOpt ? <Check className="h-3.5 w-3.5" /> :
                     isRevealed && isSelected && !isCorrectOpt ? <X className="h-3.5 w-3.5" /> :
                     String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {isRevealed && (
            <div className="rounded-lg bg-surface/50 p-3">
              <p className="text-xs text-muted">{q.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {!isRevealed ? (
          <Button onClick={reveal} disabled={selected === null} className="flex-1">
            Antwort prüfen
          </Button>
        ) : (
          <Button onClick={next} className="flex-1">
            {currentQ < quiz.questions.length - 1 ? "Nächste Frage" : "Ergebnis anzeigen"}
          </Button>
        )}
      </div>
    </div>
  );
}
