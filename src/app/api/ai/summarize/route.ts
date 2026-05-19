import { getOpenAI } from "@/lib/openai";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  text: z.string().min(1).max(10000).optional(),
  imageBase64: z.string().optional(),
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
  const { text, imageBase64 } = RequestSchema.parse(body);

  if (!text && !imageBase64) {
    return Response.json({ error: "Bitte Text oder Bild angeben." }, { status: 400 });
  }

  try {
    const messages: Array<{ role: "system" | "user"; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [
      {
        role: "system",
        content:
          "Du bist ein Lernassistent für einen Schüler der 9. Klasse in Deutschland. " +
          "Fasse den gegebenen Text kurz und verständlich zusammen. " +
          "Verwende einfache Sprache auf Deutsch. " +
          "Strukturiere die Zusammenfassung mit: " +
          "1. Kernaussage (1-2 Sätze) " +
          "2. Wichtige Punkte (Stichpunkte) " +
          "3. Merksatz (1 Satz) " +
          "Antworte immer auf Deutsch.",
      },
    ];

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Erkenne den Text in diesem Bild und fasse ihn zusammen. Falls der Text nicht vollständig erkennbar ist, fasse zusammen was du erkennen kannst und weise auf unleserliche Stellen hin.",
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ],
      });
    } else if (text) {
      messages.push({ role: "user", content: `Fasse folgenden Text zusammen:\n\n${text}` });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
      max_tokens: 800,
      temperature: 0.5,
    });

    const result = completion.choices[0]?.message?.content ?? "Keine Zusammenfassung möglich.";
    return Response.json({ summary: result });
  } catch (e) {
    console.error("OpenAI error:", e);
    return Response.json(
      { error: "Die KI-Anfrage ist fehlgeschlagen. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
