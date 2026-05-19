import { getOpenAI } from "@/lib/openai";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1).max(500),
  mode: z.enum(["learn", "quiz", "evaluate"]).default("learn"),
  answers: z.array(z.string()).optional(),
  questions: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const openai = getOpenAI();
  if (!openai) {
    return Response.json(
      { error: "KI-Funktion ist nicht verfügbar. Bitte OPENAI_API_KEY konfigurieren." },
      { status: 503 },
    );
  }

  const body = await req.json();
  const { subject, topic, mode, answers, questions } = RequestSchema.parse(body);

  try {
    let systemPrompt =
      "Du bist ein motivierender Lerncoach für einen Schüler der 9. Klasse in Deutschland. " +
      "Antworte immer auf Deutsch. Sei ermutigend und verständlich. ";

    let userPrompt = "";

    if (mode === "learn") {
      systemPrompt +=
        "Erstelle eine kurze Lerneinheit. " +
        "Antwortformat (JSON): " +
        '{ "title": "Titel", "explanation": "Klare Erklärung (max 200 Wörter)", "steps": ["Schritt 1", "Schritt 2"], "example": "Konkretes Beispiel", "tip": "Merksatz", "next_suggestion": "Was als Nächstes lernen" }';
      userPrompt = `Fach: ${subject}\nThema: ${topic}\n\nErstelle eine Lerneinheit.`;
    } else if (mode === "quiz") {
      systemPrompt +=
        "Erstelle einen Mini-Test mit 3-5 Fragen. " +
        "Antwortformat (JSON): " +
        '{ "title": "Quiz-Titel", "questions": [{ "question": "Frage", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Warum ist das richtig" }] }';
      userPrompt = `Fach: ${subject}\nThema: ${topic}\n\nErstelle einen Mini-Test.`;
    } else if (mode === "evaluate") {
      systemPrompt +=
        "Bewerte die Antworten des Schülers und gib Feedback. " +
        "Antwortformat (JSON): " +
        '{ "score": 0-100, "feedback": "Gesamtfeedback", "details": [{ "question": "Frage", "correct": true/false, "feedback": "Erklärung" }], "recommendation": "Was als Nächstes" }';
      userPrompt = `Fach: ${subject}\nThema: ${topic}\nFragen: ${JSON.stringify(questions)}\nAntworten: ${JSON.stringify(answers)}\n\nBewerte die Antworten.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4-mini-2026-03-17",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 1200,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(raw);
    return Response.json(result);
  } catch (e) {
    console.error("OpenAI error:", e);
    return Response.json(
      { error: "Die KI-Anfrage ist fehlgeschlagen. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
