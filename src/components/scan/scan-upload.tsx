"use client";

import { useState, useRef } from "react";
import { Camera, FileText, Loader2, Volume2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ScanUpload() {
  const [mode, setMode] = useState<"image" | "text">("image");
  const [text, setText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  async function submit() {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "image" ? { imageBase64 } : { text },
        ),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSummary(data.summary);
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  function speak() {
    if (!summary) return;
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.lang = "de-DE";
    utterance.onend = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  function copy() {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const canSubmit = mode === "image" ? !!imageBase64 : text.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode("image")}
          className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition cursor-pointer ${
            mode === "image"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-bg-elevated text-muted hover:text-foreground"
          }`}
        >
          <Camera className="h-4 w-4" /> Foto / Scan
        </button>
        <button
          onClick={() => setMode("text")}
          className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition cursor-pointer ${
            mode === "text"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-bg-elevated text-muted hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" /> Text eingeben
        </button>
      </div>

      {mode === "image" ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImage}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-border/60 bg-surface/20 p-8 text-center hover:border-accent/40 transition cursor-pointer"
          >
            {preview ? (
              <img src={preview} alt="Vorschau" className="mx-auto max-h-48 rounded-xl object-contain" />
            ) : (
              <div className="space-y-2">
                <Camera className="mx-auto h-8 w-8 text-muted" />
                <p className="text-sm text-muted">Tippe zum Fotografieren oder Bild hochladen</p>
              </div>
            )}
          </button>
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Füge hier den Text ein, den du zusammenfassen möchtest..."
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-foreground placeholder:text-subtle resize-none focus:border-accent focus:outline-none"
        />
      )}

      <Button onClick={submit} disabled={!canSubmit || loading} className="w-full">
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Wird zusammengefasst...</>
        ) : (
          "Zusammenfassen"
        )}
      </Button>

      {error && (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="p-4 text-sm text-danger">{error}</CardContent>
        </Card>
      )}

      {summary && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Zusammenfassung</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={speak}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface hover:text-accent transition cursor-pointer"
                  title={speaking ? "Stopp" : "Vorlesen"}
                >
                  <Volume2 className={`h-4 w-4 ${speaking ? "text-accent" : ""}`} />
                </button>
                <button
                  onClick={copy}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface hover:text-accent transition cursor-pointer"
                  title="Kopieren"
                >
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {summary}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
