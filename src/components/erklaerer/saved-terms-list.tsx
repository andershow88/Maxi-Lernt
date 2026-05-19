"use client";

import { useState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toggleFavoriteAction, deleteTermAction } from "@/server/term-actions";
import { cn } from "@/lib/utils";

type Term = {
  id: string;
  term: string;
  explanation: string | null;
  translation: string | null;
  category: string;
  favorite: boolean;
  createdAt: Date;
};

type Category = { category: string; count: number };

export function SavedTermsList({
  terms: initialTerms,
  categories,
}: {
  terms: Term[];
  categories: Category[];
}) {
  const [filter, setFilter] = useState("Alle");
  const [terms, setTerms] = useState(initialTerms);
  const [, startTransition] = useTransition();

  const filtered = filter === "Alle"
    ? terms
    : filter === "Favoriten"
      ? terms.filter((t) => t.favorite)
      : terms.filter((t) => t.category === filter);

  function toggleFav(id: string) {
    setTerms((prev) => prev.map((t) => t.id === id ? { ...t, favorite: !t.favorite } : t));
    startTransition(() => toggleFavoriteAction(id));
  }

  function remove(id: string) {
    setTerms((prev) => prev.filter((t) => t.id !== id));
    startTransition(() => deleteTermAction(id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {["Alle", "Favoriten", ...categories.map((c) => c.category)].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium border transition cursor-pointer",
              filter === c
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            {c}
            {c !== "Alle" && c !== "Favoriten" && (
              <span className="ml-1 text-subtle">
                {categories.find((cat) => cat.category === c)?.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{t.term}</span>
                    <Badge variant="default">{t.category}</Badge>
                  </div>
                  {t.translation && (
                    <p className="text-xs font-medium text-accent mt-1">{t.translation}</p>
                  )}
                  {t.explanation && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">{t.explanation}</p>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => toggleFav(t.id)}
                    className="grid h-7 w-7 place-items-center rounded-lg hover:bg-surface transition cursor-pointer"
                  >
                    <Star className={cn("h-3.5 w-3.5", t.favorite ? "text-warning fill-warning" : "text-subtle")} />
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    className="grid h-7 w-7 place-items-center rounded-lg hover:bg-danger/10 text-subtle hover:text-danger transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted py-8">Keine Begriffe in dieser Kategorie.</p>
      )}
    </div>
  );
}
