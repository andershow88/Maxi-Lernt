import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Lightbulb, Star } from "lucide-react";

type Lesson = {
  title: string;
  explanation: string;
  steps?: string[];
  example?: string;
  tip?: string;
  next_suggestion?: string;
};

export function LessonDisplay({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-accent">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Erklärung</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {lesson.explanation}
          </p>
        </CardContent>
      </Card>

      {lesson.steps && lesson.steps.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Schritt für Schritt</span>
            <ol className="space-y-1.5">
              {lesson.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/10 text-accent text-[10px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {lesson.example && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Beispiel</span>
            <p className="text-sm text-foreground italic">{lesson.example}</p>
          </CardContent>
        </Card>
      )}

      {lesson.tip && (
        <div className="flex items-start gap-2 rounded-xl bg-warning/5 border border-warning/20 p-3">
          <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-warning">Merksatz</span>
            <p className="text-sm text-foreground mt-0.5">{lesson.tip}</p>
          </div>
        </div>
      )}

      {lesson.next_suggestion && (
        <div className="flex items-start gap-2 rounded-xl bg-accent/5 border border-accent/20 p-3">
          <Star className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Als Nächstes</span>
            <p className="text-sm text-foreground mt-0.5">{lesson.next_suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
