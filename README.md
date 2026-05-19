# Maxi Lernt — Dein Schulplaner

**Repository:** https://github.com/andershow88/Maxi-Lernt.git

Eine moderne PWA für Schüler der 9. Klasse. Noten verwalten, Kalender, Scan & Zusammenfassung, Erklärer/Übersetzer und KI-Lerncoach — alles in einer App.

## Features

- **Notenübersicht** — Fächer, gewichteter Notendurchschnitt, Ranking, Verbesserungsvorschläge
- **Wochenkalender** — Schulaufgaben, Exen, Lernplanung mit täglichem Abhaken
- **Scan & Zusammenfassung** — Seiten fotografieren oder Text eingeben, KI fasst zusammen (Text + Audio)
- **Erklärer & Übersetzer** — Fachbegriffe und Fremdwörter erklären/übersetzen, Verlauf mit Kategorien
- **KI-Lerncoach** — Lerneinheiten und Mini-Quizze zu jedem Thema generieren
- **PWA** — Installierbar, offline-fähig, Push-Benachrichtigungen

## Tech Stack

| Kategorie | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, RSC, Server Actions) |
| UI | React 19, TypeScript 5 |
| Styling | Tailwind CSS v4, CSS Custom Properties |
| Animation | Framer Motion |
| Icons | Lucide React |
| DB/ORM | Prisma 6 + PostgreSQL |
| Validierung | Zod |
| KI | OpenAI API (gpt-4o-mini), optional |
| Deployment | Railway + Docker (Node 22) |

## Setup

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Datenbank konfigurieren

```bash
cp .env.example .env
# DATABASE_URL in .env anpassen
```

### 3. Datenbank initialisieren

```bash
npx prisma db push
npm run db:seed
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

### 5. OpenAI (optional)

`OPENAI_API_KEY` in `.env` setzen für:
- Scan & Zusammenfassung (OCR + Textzusammenfassung)
- Erklärer & Übersetzer (Begriffserklärung)
- KI-Lerncoach (Lerneinheiten + Quiz)

Die App funktioniert auch ohne OpenAI — KI-Features zeigen dann eine Hinweismeldung.

## Deployment (Railway)

1. Neues Projekt in Railway erstellen
2. GitHub-Repo verbinden
3. PostgreSQL-Service hinzufügen
4. Environment Variables setzen:
   - `DATABASE_URL` (Railway setzt automatisch)
   - `OPENAI_API_KEY` (optional)
5. Deploy — Railway nutzt das `Dockerfile`

## Projektstruktur

```
src/
├── app/           Seiten (Noten, Kalender, Scan, Erklärer, Lerncoach, Einstellungen)
├── components/    UI-Komponenten (Noten, Kalender, Scan, Erklärer, Lerncoach)
├── server/        Server Actions + Queries (Prisma)
├── lib/           Utilities, DB-Client, Notenberechnung, OpenAI-Helper
└── app/api/       KI-API-Routen (summarize, explain, coach)
```

## Daten bearbeiten

- **Fächer:** Über die Fächer-Verwaltung in der App (erreichbar über Einstellungen)
- **Standardfächer:** `src/lib/subjects.ts`
- **Notenberechnung:** `src/lib/grades.ts`
- **Datenbankschema:** `prisma/schema.prisma`
