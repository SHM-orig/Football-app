import { format } from "date-fns";
import type { MatchSummary } from "./types";

export type MatchTab = "live" | "upcoming" | "finished" | "all";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

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
    list = list.filter((m) => m.kickoff.slice(0, 10) === opts.date);
  }

  if (opts.search?.trim()) {
    const qRaw = opts.search.trim();
    const q = normalize(qRaw);
    const aliases =
      q === "laliga"
        ? ["laliga", "primeradivision", "spanishlaliga"]
        : q === "championsleague"
          ? ["championsleague", "uefachampionsleague", "ucl"]
          : [q];
    list = list.filter(
      (m) =>
        aliases.some((needle) =>
          normalize(
            `${m.home.name} ${m.away.name} ${m.league.name} ${m.league.country}`,
          ).includes(needle),
        ),
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
