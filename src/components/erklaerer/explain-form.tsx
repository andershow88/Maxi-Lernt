"use client";

import { useState, useTransition } from "react";
import { Search, Loader2, Star, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveTermAction } from "@/server/term-actions";

const CATEGORIES = [
  "Deutsch", "Englisch", "Mathematik", "Chemie", "Physik",
  "Geschichte", "Geographie", "Wirtschaft", "Politik", "IT", "Sonstiges",
];

type ExplainResult = {
  translation: string | null;
  explanation: string;
  example: string | null;
  category_suggestion: string;
};

export function ExplainForm() {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  async function search() {
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: term.trim(), category: category || undefined }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  function save() {
    if (!result) return;
    startTransition(async () => {
      await saveTermAction({
        term: term.trim(),
        explanation: result.explanation,
        translation: result.translation,
        category: category || result.category_suggestion || "Sonstiges",
      });
      setSaved(true);
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Begriff, Fremdwort oder Fachbegriff eingeben..."
          className="w-full rounded-xl border border-border bg-bg-elevated pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(category === c ? "" : c)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium border transition cursor-pointer ${
              category === c
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <Button onClick={search} disabled={!term.trim() || loading} className="w-full">
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Suche...</>
        ) : (
          "Erklären / Übersetzen"
        )}
      </Button>

      {error && (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="p-4 text-sm text-danger">{error}</CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-foreground">{term}</h3>
              <div className="flex items-center gap-1">
                {result.category_suggestion && (
                  <Badge variant="accent">{result.category_suggestion}</Badge>
                )}
              </div>
            </div>

            {result.translation && (
              <div className="rounded-lg bg-accent/5 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Übersetzung</span>
                <p className="text-sm font-semibold text-foreground mt-0.5">{result.translation}</p>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Erklärung</span>
              <p className="text-sm text-foreground leading-relaxed mt-0.5">{result.explanation}</p>
            </div>

            {result.example && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Beispiel</span>
                <p className="text-sm text-muted italic mt-0.5">{result.example}</p>
              </div>
            )}

            <Button
              variant={saved ? "secondary" : "outline"}
              size="sm"
              onClick={save}
              disabled={saved}
              className="w-full"
            >
              {saved ? (
                <><Star className="h-3.5 w-3.5 text-warning fill-warning" /> Gespeichert!</>
              ) : (
                <><BookmarkPlus className="h-3.5 w-3.5" /> Begriff speichern</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
