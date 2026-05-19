"use client";

import { useState, useTransition } from "react";
import { Plus, RotateCcw, Check, X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubjectPicker } from "@/components/ui/subject-picker";
import { createFlashcard, reviewFlashcard } from "@/server/flashcard-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type FlashcardData = {
  id: string;
  front: string;
  back: string;
  level: number;
  subjectName: string | null;
};

type SubjectOption = { id: string; name: string; icon?: string; color?: string };

export function FlashcardView({
  dueCards,
  totalCount,
  subjects,
}: {
  dueCards: FlashcardData[];
  totalCount: number;
  subjects: SubjectOption[];
}) {
  const [mode, setMode] = useState<"review" | "add">(dueCards.length > 0 ? "review" : "add");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [saving, startTransition] = useTransition();
  const router = useRouter();

  // Add form state
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const card = dueCards[cardIndex];
  const remaining = dueCards.length - cardIndex;

  function handleReview(correct: boolean) {
    if (!card) return;
    startTransition(async () => {
      await reviewFlashcard(card.id, correct);
      setFlipped(false);
      if (cardIndex < dueCards.length - 1) {
        setCardIndex(cardIndex + 1);
      } else {
        router.refresh();
      }
    });
  }

  function handleAdd() {
    if (!front.trim() || !back.trim()) return;
    startTransition(async () => {
      await createFlashcard(front.trim(), back.trim(), subjectId || undefined);
      setFront("");
      setBack("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode("review")}
          className={cn(
            "rounded-xl border py-2.5 text-sm font-medium transition cursor-pointer",
            mode === "review" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted",
          )}
        >
          <Layers className="inline h-4 w-4 mr-1.5" />
          Lernen ({remaining > 0 ? remaining : 0})
        </button>
        <button
          onClick={() => setMode("add")}
          className={cn(
            "rounded-xl border py-2.5 text-sm font-medium transition cursor-pointer",
            mode === "add" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted",
          )}
        >
          <Plus className="inline h-4 w-4 mr-1.5" />
          Neue Karte
        </button>
      </div>

      {/* Review mode */}
      {mode === "review" && (
        <>
          {card ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setFlipped(!flipped)}
                className="w-full cursor-pointer"
              >
                <Card className="min-h-[200px] flex items-center justify-center">
                  <CardContent className="p-6 text-center w-full">
                    {card.subjectName && (
                      <p className="text-[10px] font-semibold text-accent mb-3 uppercase tracking-wider">{card.subjectName}</p>
                    )}
                    {!flipped ? (
                      <>
                        <p className="text-lg font-semibold text-foreground leading-relaxed">{card.front}</p>
                        <p className="text-xs text-muted mt-4">Antippen um die Antwort zu sehen</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-muted mb-2">Antwort:</p>
                        <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">{card.back}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </button>

              {flipped && (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="secondary" onClick={() => handleReview(false)} disabled={saving} className="text-red-500">
                    <X className="h-4 w-4" /> Nochmal
                  </Button>
                  <Button onClick={() => handleReview(true)} disabled={saving}>
                    <Check className="h-4 w-4" /> Gewusst!
                  </Button>
                </div>
              )}

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-border/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${((cardIndex) / dueCards.length) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted">{cardIndex}/{dueCards.length}</span>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center space-y-3">
                <div className="text-4xl">🎉</div>
                <h3 className="text-lg font-bold text-foreground">Alles gelernt!</h3>
                <p className="text-sm text-muted">
                  {totalCount > 0
                    ? "Keine Karten mehr fällig. Komm später wieder!"
                    : "Noch keine Karteikarten. Erstelle deine erste!"}
                </p>
                {totalCount === 0 && (
                  <Button onClick={() => setMode("add")} size="sm">
                    <Plus className="h-3.5 w-3.5" /> Karte erstellen
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Add mode */}
      {mode === "add" && (
        <div className="space-y-4">
          <SubjectPicker
            subjects={subjects}
            value={subjectId}
            onChange={setSubjectId}
            label="Fach (optional)"
            placeholder="Kein Fach gewählt"
            allowEmpty
            emptyLabel="Kein Fach"
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Vorderseite (Frage)</label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={2}
              placeholder="z.B. Was ist Photosynthese?"
              className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle resize-none focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rückseite (Antwort)</label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={3}
              placeholder="z.B. Der Prozess, bei dem Pflanzen Lichtenergie in chemische Energie umwandeln..."
              className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle resize-none focus:border-accent focus:outline-none"
            />
          </div>

          <Button onClick={handleAdd} disabled={!front.trim() || !back.trim() || saving} className="w-full">
            <Plus className="h-4 w-4" /> Karte speichern
          </Button>
        </div>
      )}
    </div>
  );
}
