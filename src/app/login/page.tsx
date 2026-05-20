"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(data.role === "ADMIN" ? "/admin" : "/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Login fehlgeschlagen.");
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
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Maxi Lernt</h1>
          <p className="text-sm text-muted">Melde dich an, um loszulegen.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Benutzername</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
              placeholder="Benutzername eingeben"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
              placeholder="Passwort eingeben"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-md shadow-accent/20 hover:bg-accent-2 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Anmelden"}
          </button>
        </form>

        <p className="text-center text-xs text-muted">
          Noch kein Konto?{" "}
          <a href="/registrieren" className="text-accent font-medium hover:underline">Registrieren</a>
        </p>
      </div>
    </div>
  );
}
