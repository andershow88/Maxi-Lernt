"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password, inviteCode }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Registrierung fehlgeschlagen.");
      }
    } catch {
      setError("Verbindungsfehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/20">
            <UserPlus className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Registrieren</h1>
          <p className="text-sm text-muted text-center">Erstelle deinen Account mit dem Einladungscode deiner Klasse.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Dein Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="z.B. Max Mustermann"
              className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Benutzername</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="z.B. max123"
              className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mindestens 4 Zeichen"
              className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Einladungscode</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              placeholder="Von deinem Lehrer erhalten"
              className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name || !username || !password || !inviteCode}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-md shadow-accent/20 hover:bg-accent-2 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Account erstellen"}
          </button>
        </form>

        <p className="text-center text-xs text-muted">
          Schon registriert?{" "}
          <a href="/login" className="text-accent font-medium hover:underline">Anmelden</a>
        </p>
      </div>
    </div>
  );
}
