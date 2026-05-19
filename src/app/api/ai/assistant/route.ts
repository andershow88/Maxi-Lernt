import { getOpenAI } from "@/lib/openai";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type OpenAI from "openai";

export const dynamic = "force-dynamic";

type Tool = NonNullable<OpenAI.ChatCompletionCreateParams["tools"]>[number];
type Msg = OpenAI.ChatCompletionMessageParam;

const MODEL = "gpt-5.4-mini-2026-03-17";

const tools: Tool[] = [
  {
    type: "function" as const,
    function: {
      name: "get_grades",
      description: "Alle Noten des Schülers abrufen, optional gefiltert nach Fach",
      parameters: {
        type: "object",
        properties: {
          subjectName: { type: "string", description: "Fachname zum Filtern (optional)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_events",
      description: "Kommende Termine und Prüfungen abrufen",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Anzahl der Termine (Standard: 10)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_subjects",
      description: "Alle Schulfächer auflisten",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_grade",
      description: "Eine neue Note eintragen. IMMER zuerst als Vorschlag zurückgeben, NIE direkt ausführen.",
      parameters: {
        type: "object",
        properties: {
          subjectName: { type: "string", description: "Name des Fachs" },
          value: { type: "number", description: "Note (1-6, auch Halbnoten wie 1.5)" },
          weight: { type: "number", description: "Gewichtung: 0.5, 1 oder 2", enum: [0.5, 1, 2] },
          type: { type: "string", enum: ["SCHULAUFGABE", "EX", "MUENDLICH", "SONSTIGE"] },
          date: { type: "string", description: "Datum im Format YYYY-MM-DD" },
          note: { type: "string", description: "Optionale Notiz" },
        },
        required: ["subjectName", "value", "type"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_event",
      description: "Einen neuen Termin/Prüfung anlegen. IMMER zuerst als Vorschlag zurückgeben, NIE direkt ausführen.",
      parameters: {
        type: "object",
        properties: {
          subjectName: { type: "string", description: "Name des Fachs (optional)" },
          title: { type: "string", description: "Titel des Termins" },
          date: { type: "string", description: "Datum im Format YYYY-MM-DD" },
          time: { type: "string", description: "Uhrzeit (optional)" },
          type: { type: "string", enum: ["SCHULAUFGABE", "EX", "TEST", "REFERAT", "HAUSAUFGABE", "LERNTERMIN", "SONSTIGER"] },
          note: { type: "string", description: "Optionale Notiz" },
        },
        required: ["title", "date", "type"],
      },
    },
  },
];

async function handleToolCall(name: string, args: Record<string, unknown>): Promise<unknown> {
  if (name === "get_grades") {
    const where: Record<string, unknown> = {};
    if (args.subjectName) {
      const subject = await prisma.subject.findFirst({
        where: { name: { contains: args.subjectName as string, mode: "insensitive" } },
      });
      if (subject) where.subjectId = subject.id;
    }
    const grades = await prisma.grade.findMany({
      where,
      include: { subject: true },
      orderBy: { date: "desc" },
    });
    return grades.map((g) => ({
      fach: g.subject.name,
      note: g.value,
      gewichtung: g.weight,
      art: g.type,
      datum: g.date.toISOString().split("T")[0],
      notiz: g.note,
    }));
  }

  if (name === "get_events") {
    const limit = (args.limit as number) || 10;
    const events = await prisma.calendarEvent.findMany({
      where: { date: { gte: new Date() } },
      include: { subject: true },
      orderBy: { date: "asc" },
      take: limit,
    });
    return events.map((e) => ({
      titel: e.title,
      fach: e.subject?.name ?? null,
      datum: e.date.toISOString().split("T")[0],
      uhrzeit: e.time,
      art: e.type,
      notiz: e.note,
    }));
  }

  if (name === "get_subjects") {
    const subjects = await prisma.subject.findMany({
      where: { hidden: false },
      orderBy: { order: "asc" },
    });
    return subjects.map((s) => ({ name: s.name, id: s.id }));
  }

  if (name === "create_grade") {
    const subject = await prisma.subject.findFirst({
      where: { name: { contains: args.subjectName as string, mode: "insensitive" } },
    });
    if (!subject) return { error: `Fach "${args.subjectName}" nicht gefunden` };
    return {
      pending_action: "create_grade",
      data: {
        subjectId: subject.id,
        subjectName: subject.name,
        value: args.value,
        weight: args.weight ?? 1,
        type: args.type,
        date: args.date ?? new Date().toISOString().split("T")[0],
        note: args.note ?? null,
      },
    };
  }

  if (name === "create_event") {
    let subjectId = null;
    let subjectName = null;
    if (args.subjectName) {
      const subject = await prisma.subject.findFirst({
        where: { name: { contains: args.subjectName as string, mode: "insensitive" } },
      });
      if (subject) {
        subjectId = subject.id;
        subjectName = subject.name;
      }
    }
    return {
      pending_action: "create_event",
      data: {
        subjectId,
        subjectName,
        title: args.title,
        date: args.date,
        time: args.time ?? null,
        type: args.type,
        note: args.note ?? null,
      },
    };
  }

  return { error: "Unbekannte Funktion" };
}

async function resolveToolCalls(openai: OpenAI, messages: Msg[]): Promise<{ messages: Msg[]; pending?: { action: string; data: Record<string, unknown> } }> {
  let rounds = 0;

  while (rounds < 3) {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      max_completion_tokens: 800,
      temperature: 0.5,
    });

    const choice = completion.choices[0];
    if (choice?.finish_reason !== "tool_calls" || !choice.message.tool_calls) {
      messages.push(choice.message);
      return { messages };
    }

    rounds++;
    messages.push(choice.message);

    for (const tc of choice.message.tool_calls) {
      const args = JSON.parse(tc.function.arguments);
      const result = await handleToolCall(tc.function.name, args);

      if (result && typeof result === "object" && "pending_action" in (result as Record<string, unknown>)) {
        const pending = result as { pending_action: string; data: Record<string, unknown> };
        messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
        return { messages, pending: { action: pending.pending_action, data: pending.data } };
      }

      messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
    }
  }

  return { messages };
}

const RequestSchema = z.object({
  message: z.string().min(1).max(1000),
  confirm: z.object({
    action: z.string(),
    data: z.record(z.unknown()),
  }).optional(),
});

export async function POST(req: Request) {
  const openai = getOpenAI();
  if (!openai) {
    return Response.json(
      { error: "KI nicht verfügbar. Bitte OPENAI_API_KEY konfigurieren." },
      { status: 503 },
    );
  }

  const body = await req.json();
  const { message, confirm } = RequestSchema.parse(body);

  if (confirm) {
    try {
      const result = await executeAction(confirm.action, confirm.data);
      return Response.json(result);
    } catch {
      return Response.json({ error: "Aktion fehlgeschlagen." }, { status: 500 });
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const systemPrompt =
    `Du bist der KI-Assistent in der Schulplaner-App "Maxi Lernt" für einen Schüler der 9. Klasse in Bayern. ` +
    `Heute ist ${today}. Antworte auf Deutsch, kurz und freundlich. Nutze Markdown für Formatierung (fett, Listen, etc.). ` +
    `Du kannst allgemeine Fragen beantworten UND auf Schuldaten zugreifen (Noten, Termine, Fächer). ` +
    `Wenn der Schüler eine Aktion will (Note eintragen, Termin anlegen), nutze die passende Funktion. ` +
    `WICHTIG: Bei Aktionen (create_grade, create_event) beschreibe dem Schüler GENAU was du anlegen wirst und frage ob das so passt. ` +
    `Setze NIEMALS Standardwerte ohne den Schüler zu fragen — wenn Infos fehlen (Datum, Gewichtung, Art), frage nach. ` +
    `Halte Antworten kurz (2-3 Sätze wenn möglich).`;

  try {
    const messages: Msg[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    // Resolve tool calls (non-streamed)
    const { messages: resolved, pending } = await resolveToolCalls(openai, messages);

    // If there's a pending action, stream the description
    if (pending) {
      const stream = await openai.chat.completions.create({
        model: MODEL,
        messages: resolved,
        max_completion_tokens: 300,
        temperature: 0.3,
        stream: true,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          // Send pending action metadata first
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ pending_action: pending.action, pending_data: pending.data })}\n\n`));

          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: delta })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(readable, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    // Stream the final response
    const lastMsg = resolved[resolved.length - 1];
    if (lastMsg && "content" in lastMsg && typeof lastMsg.content === "string" && lastMsg.content) {
      // Already have content from non-tool response — but let's re-stream for consistency
    }

    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: resolved.slice(0, -1),
      max_completion_tokens: 800,
      temperature: 0.5,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: delta })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Assistant error:", msg);
    return Response.json({ error: `KI-Fehler: ${msg}` }, { status: 500 });
  }
}

async function executeAction(action: string, data: Record<string, unknown>) {
  if (action === "create_grade") {
    await prisma.grade.create({
      data: {
        subjectId: data.subjectId as string,
        value: data.value as number,
        weight: data.weight as number,
        type: data.type as "SCHULAUFGABE" | "EX" | "MUENDLICH" | "SONSTIGE",
        date: new Date(data.date as string),
        note: data.note as string | null,
      },
    });
    return { success: true, message: "Note wurde eingetragen!" };
  }

  if (action === "create_event") {
    await prisma.calendarEvent.create({
      data: {
        subjectId: data.subjectId as string | null,
        title: data.title as string,
        date: new Date(data.date as string),
        time: data.time as string | null,
        type: data.type as "SCHULAUFGABE" | "EX" | "TEST" | "REFERAT" | "HAUSAUFGABE" | "LERNTERMIN" | "SONSTIGER",
        note: data.note as string | null,
      },
    });
    return { success: true, message: "Termin wurde angelegt!" };
  }

  return { error: "Unbekannte Aktion" };
}
