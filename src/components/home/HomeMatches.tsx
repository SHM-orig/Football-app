"use client";

import { MatchList } from "@/components/matches/MatchList";
import type { LeagueRef, MatchSummary } from "@/lib/types";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";

type Tab = "all" | "live" | "upcoming" | "finished";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to load");
    return r.json();
  });

export function HomeMatches({ leagues }: { leagues: LeagueRef[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [leagueId, setLeagueId] = useState<string>("");
  const [date, setDate] = useState("");
  const [q, setQ] = useState("");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("tab", tab);
    if (leagueId) p.set("leagueId", leagueId);
    if (date) p.set("date", date);
    if (q.trim()) p.set("q", q.trim());
    return p.toString();
  }, [tab, leagueId, date, q]);

  const { data, error, isLoading, mutate } = useSWR<{ matches: MatchSummary[] }>(
    `/api/matches?${query}`,
    fetcher,
    {
      refreshInterval: tab === "live" || tab === "all" ? 30_000 : 0,
      revalidateOnFocus: true,
    },
  );

  const matches = data?.matches ?? [];

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "live", label: "Live" },
    { id: "upcoming", label: "Upcoming" },
    { id: "finished", label: "Finished" },
  ];

  const clearFilters = useCallback(() => {
    setLeagueId("");
    setDate("");
    setQ("");
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Matches
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Live updates every 30s when browsing live or all matches.
          </p>
        </div>
        <button
          type="button"
          onClick={() => mutate()}
          className="self-start rounded-xl border border-[var(--card-border)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
        >
          Refresh
        </button>
      </div>

      <div className="surface flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                tab === t.id
                  ? "bg-[var(--accent)] text-[#041208]"
                  : "bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex min-w-[160px] flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-[var(--muted)]">
            League
          </label>
          <select
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm"
          >
            <option value="">All leagues</option>
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-[160px] flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-[var(--muted)]">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm"
          />
        </div>
        <div className="min-w-[200px] flex-1 flex-col gap-1 sm:flex sm:min-w-[220px]">
          <label className="text-xs font-medium text-[var(--muted)]">
            Search team / league
          </label>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Arsenal, La Liga…"
            className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-dashed border-[var(--card-border)] px-4 py-2 text-sm text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
        >
          Reset filters
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500">Could not load matches. Try again.</p>
      )}
      {isLoading && !data ? (
        <div className="surface p-10 text-center text-[var(--muted)]">
          Loading fixtures…
        </div>
      ) : (
        <MatchList matches={matches} />
      )}
    </div>
  );
}
