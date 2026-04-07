import { format, isSameDay, parseISO } from "date-fns";
import type { MatchSummary } from "./types";

export type MatchTab = "live" | "upcoming" | "finished" | "all";

export function filterMatches(
  matches: MatchSummary[],
  opts: {
    tab?: MatchTab;
    leagueId?: string | null;
    date?: string | null;
    search?: string | null;
  },
): MatchSummary[] {
  let list = [...matches];

  if (opts.tab && opts.tab !== "all") {
    list = list.filter((m) => {
      if (opts.tab === "live") return m.status === "live";
      if (opts.tab === "upcoming") return m.status === "scheduled";
      if (opts.tab === "finished") return m.status === "finished";
      return true;
    });
  }

  if (opts.leagueId) {
    list = list.filter((m) => m.league.id === opts.leagueId);
  }

  if (opts.date) {
    const d = parseISO(`${opts.date}T12:00:00`);
    list = list.filter((m) => isSameDay(parseISO(m.kickoff), d));
  }

  if (opts.search?.trim()) {
    const q = opts.search.trim().toLowerCase();
    list = list.filter(
      (m) =>
        m.home.name.toLowerCase().includes(q) ||
        m.away.name.toLowerCase().includes(q) ||
        m.league.name.toLowerCase().includes(q),
    );
  }

  list.sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
  );
  return list;
}

export function todayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}
