"use client";

import { PlayerCard } from "@/components/player/PlayerCard";
import type { PlayerProfile } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function SearchClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = sp.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const runSearch = useCallback(async (query: string) => {
    const t = query.trim();
    if (!t) {
      setPlayers([]);
      setError(null);
      setHint(null);
      return;
    }
    setLoading(true);
    setError(null);
    setHint(null);
    try {
      const res = await fetch(
        `/api/players/search?q=${encodeURIComponent(t)}`,
      );
      if (!res.ok) {
        throw new Error("Failed to search players.");
      }
      const data = (await res.json()) as {
        players?: PlayerProfile[];
        error?: string | null;
        indexCount?: number;
      };
      setPlayers(data.players ?? []);
      setError(data.error ?? null);
      if ((data.indexCount ?? 0) === 0) {
        setHint("Tip: run `npm run sync:players` to build the local player index.");
      }
    } catch {
      setPlayers([]);
      setError("Could not load players. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setQ(initial);
    runSearch(initial);
  }, [initial, runSearch]);

  useEffect(() => {
    const t = q.trim();
    const timer = setTimeout(() => {
      if (!t) {
        setPlayers([]);
        setError(null);
        setHint(null);
        router.replace("/search");
        return;
      }
      router.replace(`/search?q=${encodeURIComponent(t)}`);
      runSearch(t);
    }, 350);

    return () => clearTimeout(timer);
  }, [q, router, runSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Search</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Find players by name from your synced index and live API data.
        </p>
      </div>

      <form
        className="surface flex flex-col gap-3 p-4 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Player name…"
          className="min-h-11 flex-1 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-[#041208]"
        >
          Search
        </button>
      </form>

      {loading && (
        <p className="text-sm text-[var(--muted)]">Searching…</p>
      )}

      {!loading && players.length === 0 && q.trim() && (
        <p className="text-sm text-[var(--muted)]">No players found.</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {hint && <p className="text-xs text-[var(--muted)]">{hint}</p>}

      <ul className="grid gap-3 sm:grid-cols-2">
        {players.map((p) => (
          <li key={p.id}>
            <PlayerCard player={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
