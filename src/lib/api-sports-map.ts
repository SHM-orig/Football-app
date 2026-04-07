import type { MatchDetail, MatchStatRow, MatchSummary, TeamLineup, TimelineEvent } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function statusFromShort(short: string): MatchSummary["status"] {
  const s = (short || "").toUpperCase();
  if (s === "LIVE" || s === "1H" || s === "2H" || s === "HT" || s === "ET")
    return "live";
  if (s === "FT" || s === "AET" || s === "PEN") return "finished";
  return "scheduled";
}

function minuteFromFixture(f: any): string | null {
  const elapsed = f?.fixture?.status?.elapsed;
  if (elapsed == null) return null;
  return `${elapsed}'`;
}

export function mapFixtureToSummary(row: any): MatchSummary | null {
  try {
    const f = row.fixture;
    const teams = row.teams;
    const goals = row.goals;
    const league = row.league;
    if (!f?.id || !teams?.home || !teams?.away) return null;

    const short = f.status?.short || "NS";
    const st = statusFromShort(short);

    return {
      id: String(f.id),
      league: {
        id: String(league?.id ?? "unknown"),
        name: league?.name ?? "League",
        country: league?.country ?? "",
        logo: league?.logo,
        season: league?.season ? String(league.season) : undefined,
      },
      home: {
        id: String(teams.home.id),
        name: teams.home.name,
        logo: teams.home.logo,
      },
      away: {
        id: String(teams.away.id),
        name: teams.away.name,
        logo: teams.away.logo,
      },
      homeScore: goals?.home ?? null,
      awayScore: goals?.away ?? null,
      minute: st === "live" ? minuteFromFixture(row) : null,
      status: st,
      kickoff: f.date,
      venue: f.venue?.name,
    };
  } catch {
    return null;
  }
}

export function mapEventsToTimeline(
  events: any[],
  homeTeamId?: number | null,
): TimelineEvent[] {
  if (!Array.isArray(events)) return [];
  return events.map((e, i) => {
    const tid = e?.team?.id as number | undefined;
    const team: "home" | "away" =
      homeTeamId != null && tid != null && tid === homeTeamId
        ? "home"
        : "away";
    const typeRaw = String(e?.type ?? "").toLowerCase();
    const type: TimelineEvent["type"] =
      typeRaw === "card"
        ? "card"
        : typeRaw === "subst"
          ? "subst"
          : typeRaw === "var"
            ? "var"
            : typeRaw === "goal"
              ? "goal"
              : "period";
    return {
      id: `${e?.time?.elapsed ?? i}-${i}`,
      minute: e?.time?.elapsed != null ? `${e.time.elapsed}'` : "?",
      type,
      team,
      detail: e?.detail ?? e?.type ?? "",
      player: e?.player?.name,
      assist: e?.assist?.name,
    };
  });
}

function sidePlayers(list: any[], prefix: string): TeamLineup["starting"] {
  if (!Array.isArray(list)) return [];
  return list.map((p, i) => ({
    id: `${prefix}-${p.player?.id ?? i}`,
    name: p.player?.name ?? "Player",
    number: p.player?.number ?? i + 1,
    pos: p.player?.pos ?? "",
    isCaptain: Boolean(p.player?.captain),
  }));
}

export function mapLineupsPayload(lineups: any[]): {
  home: TeamLineup;
  away: TeamLineup;
} {
  const h = lineups?.[0];
  const a = lineups?.[1];
  return {
    home: {
      formation: h?.formation,
      starting: sidePlayers(h?.startXI, "h"),
      substitutes: sidePlayers(h?.substitutes, "hs"),
    },
    away: {
      formation: a?.formation,
      starting: sidePlayers(a?.startXI, "a"),
      substitutes: sidePlayers(a?.substitutes, "as"),
    },
  };
}

const STAT_LABELS: Record<string, string> = {
  "Ball Possession": "Ball possession",
  "Total Shots": "Total shots",
  "Shots on Goal": "Shots on target",
  "Passes %": "Pass accuracy %",
  "Passes": "Passes",
  "Fouls": "Fouls",
  "Corner Kicks": "Corners",
  "Offsides": "Offsides",
};

export function mapStatisticsPayload(stats: any[]): MatchStatRow[] {
  if (!Array.isArray(stats) || stats.length < 2) return [];
  const home = stats[0]?.statistics ?? [];
  const away = stats[1]?.statistics ?? [];
  const rows: MatchStatRow[] = [];
  for (let i = 0; i < Math.min(home.length, away.length); i++) {
    const hi = home[i];
    const ai = away[i];
    const label = STAT_LABELS[hi?.type] ?? hi?.type;
    if (!label) continue;
    let hv = hi?.value;
    let av = ai?.value;
    if (typeof hv === "string" && hv.endsWith("%")) {
      hv = parseInt(hv, 10) || 0;
    }
    if (typeof av === "string" && av.endsWith("%")) {
      av = parseInt(av, 10) || 0;
    }
    rows.push({
      label,
      home: Number(hv) || 0,
      away: Number(av) || 0,
    });
  }
  return rows;
}

export function buildDetailFromApiParts(
  summary: MatchSummary,
  events: any[],
  lineups: any[],
  statistics: any[],
  homeTeamId?: number | null,
): MatchDetail {
  let tl = mapEventsToTimeline(events, homeTeamId);
  if (!tl.length) {
    tl = [
      {
        id: "kick",
        minute: "0'",
        type: "period",
        team: "home",
        detail: "Match timeline",
      },
    ];
  }
  const lu = mapLineupsPayload(lineups);
  const st =
    mapStatisticsPayload(statistics).length > 0
      ? mapStatisticsPayload(statistics)
      : [
          { label: "Ball possession", home: 50, away: 50 },
          { label: "Total shots", home: 0, away: 0 },
        ];

  return {
    ...summary,
    timeline: tl,
    lineups: lu,
    stats: st,
  };
}
