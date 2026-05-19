"use client";

import { useState, useTransition } from "react";
import { Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSubjectAction, toggleSubjectVisibility, deleteSubjectAction } from "@/server/subject-actions";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import type { Subject } from "@prisma/client";

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#f43f5e", "#0d9488", "#64748b", "#b45309",
];

export function SubjectManager({ subjects: initial }: { subjects: Subject[] }) {
  const [subjects, setSubjects] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#4F46E5");
  const [, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createSubjectAction(formData);
      if (result.ok) {
        setNewName("");
        setShowForm(false);
        window.location.reload();
      }
    });
  }

  function handleToggle(id: string) {
    setSubjects((prev) => prev.map((s) => s.id === id ? { ...s, hidden: !s.hidden } : s));
    startTransition(() => { toggleSubjectVisibility(id); });
  }

  function handleDelete(id: string) {
    if (!confirm("Fach und alle Noten wirklich löschen?")) return;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    startTransition(() => { deleteSubjectAction(id); });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {subjects.map((s) => {
          const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[s.icon] ?? Icons.BookOpen;
          return (
            <Card key={s.id} className={cn(s.hidden && "opacity-50")}>
              <CardContent className="p-3 flex items-center gap-3">
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: `${s.color}18`, color: s.color }}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">{s.name}</span>
                <button
                  onClick={() => handleToggle(s.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface text-muted transition cursor-pointer"
                  title={s.hidden ? "Einblenden" : "Ausblenden"}
                >
                  {s.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-danger/10 text-subtle hover:text-danger transition cursor-pointer"
                  title="Löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showForm ? (
        <Card>
          <CardContent className="p-4">
            <form action={handleCreate} className="space-y-3">
              <input
                name="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Fachname..."
                required
                className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition cursor-pointer",
                      newColor === c ? "border-foreground scale-110" : "border-transparent",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input type="hidden" name="color" value={newColor} />
              <input type="hidden" name="icon" value="BookOpen" />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1">Speichern</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Abbrechen</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="secondary" className="w-full" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Neues Fach hinzufügen
        </Button>
      )}
    </div>
  );
}
