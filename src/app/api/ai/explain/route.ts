import { getOpenAI } from "@/lib/openai";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  term: z.string().min(1).max(500),
  category: z.string().optional(),
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
  const { term, category } = RequestSchema.parse(body);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Lernassistent für einen Schüler der 9. Klasse in Deutschland. " +
            "Wenn der Begriff ein Fremdwort oder anderssprachiges Wort ist, übersetze es zuerst ins Deutsche. " +
            "Dann erkläre den Begriff einfach und verständlich. " +
            "Verwende Beispiele wenn sinnvoll. " +
            "Halte die Erklärung kurz (max. 150 Wörter). " +
            "Antworte immer auf Deutsch. " +
            "Antwortformat (JSON): " +
            '{ "translation": "Übersetzung oder null", "explanation": "Einfache Erklärung", "example": "Beispiel oder null", "category_suggestion": "Vorgeschlagene Kategorie" }',
        },
        {
          role: "user",
          content: `Erkläre oder übersetze: "${term}"${category ? ` (Fach: ${category})` : ""}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.5,
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
