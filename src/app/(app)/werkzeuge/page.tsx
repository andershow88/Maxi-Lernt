import Link from "next/link";
import { Calculator, GraduationCap, Timer, Layers, BookOpenCheck, History } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const TOOLS = [
  {
    href: "/werkzeuge/notenrechner",
    label: "Notenrechner",
    description: "Was wäre wenn? Simuliere deine nächste Note.",
    icon: Calculator,
    color: "#3b82f6",
  },
  {
    href: "/werkzeuge/zeugnis",
    label: "Zeugnis",
    description: "Deine Zeugnisnoten auf einen Blick.",
    icon: GraduationCap,
    color: "#8b5cf6",
  },
  {
    href: "/werkzeuge/lernzeit",
    label: "Lernzeit",
    description: "Tracke wie viel du pro Fach lernst.",
    icon: Timer,
    color: "#10b981",
  },
  {
    href: "/werkzeuge/karteikarten",
    label: "Karteikarten",
    description: "Lerne mit Flashcards — manuell oder per KI.",
    icon: Layers,
    color: "#f59e0b",
  },
  {
    href: "/erklaerer",
    label: "Erklärer",
    description: "Begriffe erklären und übersetzen lassen.",
    icon: BookOpenCheck,
    color: "#ec4899",
    extra: { href: "/erklaerer/verlauf", icon: History, label: "Verlauf" },
  },
];

export default function WerkzeugePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Werkzeuge" description="Alles was dir beim Lernen hilft." />

      <div className="grid grid-cols-2 gap-3">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-bg-elevated p-4 transition hover:shadow-md hover:border-accent/30"
          >
            <div
              className="grid h-11 w-11 place-items-center rounded-xl"
              style={{ backgroundColor: `${t.color}15`, color: t.color }}
            >
              <t.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition">{t.label}</h3>
              <p className="text-[11px] text-muted leading-relaxed mt-0.5">{t.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
