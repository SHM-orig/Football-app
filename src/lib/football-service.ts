import { apiSportsFetch, hasApiSportsKey } from "./api-sports";
import { buildDetailFromApiParts, mapFixtureToSummary } from "./api-sports-map";
import { fetchEspnMatchesByDate, getEspnLeagues } from "./espn-football";
import { filterMatches, type MatchTab } from "./filter-matches";
import {
  getMockLeagues,
  getMockMatchDetail,
  getMockMatches,
  getMockPlayer,
  getMockStandings,
  searchMockPlayers,
} from "./mock-data";
import type { LeagueRef, MatchDetail, MatchSummary, PlayerProfile, StandingRow } from "./types";

interface FixturesResponse {
  response?: unknown[];
}

interface ApiStandingsRow {
  rank?: number;
  team?: { id?: number; name?: string; logo?: string };
  all?: {
    played?: number;
    win?: number;
    draw?: number;
    lose?: number;
    goals?: { for?: number; against?: number };
  };
  points?: number;
  form?: string;
}

interface ApiPlayerResponseRow {
  player?: {
    id?: number;
    name?: string;
    firstname?: string;
    lastname?: string;
    age?: number;
    nationality?: string;
    photo?: string;
  };
  statistics?: Array<{
    team?: { id?: number; name?: string; logo?: string };
    games?: { position?: string; minutes?: number; rating?: string; appearences?: number; appearances?: number };
    goals?: { total?: number; assists?: number };
    cards?: { yellow?: { total?: number }; red?: { total?: number } };
  }>;
}

function mapApiPlayerRowToProfile(row: ApiPlayerResponseRow): PlayerProfile | null {
  if (!row.player?.id) return null;
  const stats = row.statistics?.[0] ?? {};
  const games = stats.games ?? {};
  const goals = stats.goals ?? {};
  const cards = stats.cards ?? {};
  return {
    id: String(row.player.id),
    name: row.player.name ?? "Unknown Player",
    firstname: row.player.firstname ?? "",
    lastname: row.player.lastname ?? "",
    age: row.player.age,
    nationality: row.player.nationality ?? "Unknown",
    photo: row.player.photo,
    team: stats.team
      ? {
          id: String(stats.team.id),
          name: stats.team.name ?? "Unknown Team",
          logo: stats.team.logo,
        }
      : undefined,
    position: games.position,
    marketValue: "—",
    stats: {
      appearances: games.appearences ?? games.appearances ?? 0,
      goals: goals.total ?? 0,
      assists: goals.assists ?? 0,
      minutes: games.minutes ?? 0,
      rating: String(games.rating ?? "—"),
      yellowCards: cards.yellow?.total ?? 0,
      redCards: cards.red?.total ?? 0,
    },
  };
}

function uniqueById(matches: MatchSummary[]): MatchSummary[] {
  const map = new Map<string, MatchSummary>();
  for (const m of matches) map.set(m.id, m);
  return [...map.values()];
}

function buildFallbackDetailFromSummary(summary: MatchSummary): MatchDetail {
  return {
    ...summary,
    timeline: [
      {
        id: "info",
        minute: "0'",
        type: "period",
        team: "home",
        detail: "Detailed events are currently unavailable for this fixture.",
      },
    ],
    lineups: {
      home: { formation: undefined, starting: [], substitutes: [] },
      away: { formation: undefined, starting: [], substitutes: [] },
    },
    stats: [],
  };
}

export async function listMatches(params: {
  tab?: MatchTab;
  leagueId?: string | null;
  date?: string | null;
  search?: string | null;
}): Promise<MatchSummary[]> {
  const dateStr = params.date?.trim() || null;

  if (hasApiSportsKey()) {
    const leagueParam = params.leagueId ? { league: params.leagueId } : {};
    const chunks: MatchSummary[] = [];

    if (params.tab === "live" || params.tab === "all") {
      const liveData = await apiSportsFetch<FixturesResponse>("/fixtures", {
        live: "all",
        ...leagueParam,
      });
      chunks.push(
        ...((liveData?.response ?? [])
          .map(mapFixtureToSummary)
          .filter(Boolean) as MatchSummary[]),
      );
    }

    if (params.tab !== "live") {
      const dayData = await apiSportsFetch<FixturesResponse>(
        "/fixtures",
        dateStr
          ? {
              date: dateStr,
              ...leagueParam,
            }
          : {
              next: 200,
              ...leagueParam,
            },
      );
      chunks.push(
        ...((dayData?.response ?? [])
          .map(mapFixtureToSummary)
          .filter(Boolean) as MatchSummary[]),
      );
    }

    const merged = uniqueById(chunks);
    if (merged.length) {
      return filterMatches(merged, params);
    }
  }

  if (dateStr) {
    const espn = await fetchEspnMatchesByDate(dateStr);
    if (espn.length) {
      return filterMatches(espn, params);
    }
  } else {
    const base = new Date();
    const dates = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
    const espnChunks = await Promise.all(dates.map((d) => fetchEspnMatchesByDate(d)));
    const espn = uniqueById(espnChunks.flat());
    if (espn.length) {
      return filterMatches(espn, params);
    }
  }

  return filterMatches(getMockMatches(), params);
}

export async function getMatchDetail(id: string): Promise<MatchDetail | null> {
  if (hasApiSportsKey()) {
    const fix = await apiSportsFetch<FixturesResponse>("/fixtures", { id });
    const row = fix?.response?.[0];
    const summary = row ? mapFixtureToSummary(row) : null;
    if (summary) {
      const [ev, lu, st] = await Promise.all([
        apiSportsFetch<FixturesResponse>("/fixtures/events", {
          fixture: id,
        }),
        apiSportsFetch<FixturesResponse>("/fixtures/lineups", {
          fixture: id,
        }),
        apiSportsFetch<FixturesResponse>("/fixtures/statistics", {
          fixture: id,
        }),
      ]);
      const events = (ev as { response?: unknown[] })?.response ?? [];
      const lineups = (lu as { response?: unknown[] })?.response ?? [];
      const statistics = (st as { response?: unknown[] })?.response ?? [];
      const homeId = (row as { teams?: { home?: { id?: number } } })?.teams?.home
        ?.id;
      return buildDetailFromApiParts(
        summary,
        events,
        lineups,
        statistics,
        homeId ?? null,
      );
    }
  }

  const mock = getMockMatchDetail(id);
  if (mock) return mock;

  // Fallback for non-API-Sports IDs (e.g. ESPN fixtures) so detail page never 404s
  const aroundToday = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 2 + i);
    return d.toISOString().slice(0, 10);
  });
  const espnBatches = await Promise.all(aroundToday.map((d) => fetchEspnMatchesByDate(d)));
  const espnMatch = uniqueById(espnBatches.flat()).find((m) => m.id === id);
  if (espnMatch) return buildFallbackDetailFromSummary(espnMatch);

  // Final fallback: if match exists in current broad listing, synthesize detail.
  const listed = await listMatches({ tab: "all", date: null, leagueId: null, search: null });
  const found = listed.find((m) => m.id === id);
  if (found) return buildFallbackDetailFromSummary(found);

  return null;
}

export async function listLeagues(): Promise<LeagueRef[]> {
  if (hasApiSportsKey()) {
    const data = await apiSportsFetch<{ response?: { league?: LeagueRef }[] }>(
      "/leagues",
      { current: "true" },
    );
    const raw = data?.response ?? [];
    const mapped: LeagueRef[] = raw
      .map((r) => r.league)
      .filter(Boolean)
      .map((l) => ({
        id: String((l as LeagueRef).id),
        name: (l as LeagueRef).name,
        country: (l as LeagueRef).country ?? "",
        logo: (l as LeagueRef).logo,
      }))
      .slice(0, 40);
    if (mapped.length) return mapped;
  }
  const espnLeagues = getEspnLeagues();
  if (espnLeagues.length) return espnLeagues;
  return getMockLeagues();
}

export async function getStandings(leagueId: string): Promise<StandingRow[]> {
  if (hasApiSportsKey() && /^\d+$/.test(leagueId)) {
    const data = await apiSportsFetch<{
      response?: {
        league?: { id?: number; season?: number };
        standings?: unknown[][][];
      }[];
    }>("/standings", { league: leagueId, season: new Date().getFullYear() });
    const table = data?.response?.[0]?.standings?.[0];
    if (Array.isArray(table)) {
      return table.map((row, idx: number) => {
        const r = row as ApiStandingsRow;
        return {
          rank: r.rank ?? idx + 1,
          team: {
            id: String(r.team?.id),
            name: r.team?.name ?? "Team",
            logo: r.team?.logo,
          },
          played: r.all?.played ?? 0,
          won: r.all?.win ?? 0,
          drawn: r.all?.draw ?? 0,
          lost: r.all?.lose ?? 0,
          goalsFor: r.all?.goals?.for ?? 0,
          goalsAgainst: r.all?.goals?.against ?? 0,
          points: r.points ?? 0,
          form: r.form ? r.form.split("") : undefined,
        };
      });
    }
  }
  return getMockStandings(leagueId);
}

export async function getPlayer(id: string): Promise<PlayerProfile | null> {
  if (hasApiSportsKey()) {
    const prof = await apiSportsFetch<{ response?: unknown[] }>("/players", {
      id,
      season: new Date().getFullYear(),
    });
    const p = prof?.response?.[0] as ApiPlayerResponseRow | undefined;
    if (p?.player) {
      const stats = p.statistics?.[0] ?? {};
      const games = stats.games ?? {};
      const goals = stats.goals?.total ?? 0;
      const cards = stats.cards ?? {};
      return {
        id: String(p.player.id),
        name: p.player.name ?? "Unknown Player",
        firstname: p.player.firstname ?? "",
        lastname: p.player.lastname ?? "",
        age: p.player.age,
        nationality: p.player.nationality ?? "Unknown",
        photo: p.player.photo,
        team: stats.team
          ? {
              id: String(stats.team.id),
              name: stats.team.name ?? "Unknown Team",
              logo: stats.team.logo,
            }
          : undefined,
        position: games.position,
        marketValue: "—",
        stats: {
          appearances: games.appearences ?? games.appearances ?? 0,
          goals: typeof goals === "number" ? goals : 0,
          assists: stats.goals?.assists ?? 0,
          minutes: games.minutes ?? 0,
          rating: String(stats.games?.rating ?? "—"),
          yellowCards: cards.yellow?.total ?? 0,
          redCards: cards.red?.total ?? 0,
        },
      };
    }
  }
  return getMockPlayer(id);
}

export async function searchPlayers(q: string): Promise<PlayerProfile[]> {
  const query = q.trim();
  if (!query) return [];
  if (hasApiSportsKey()) {
    const data = await apiSportsFetch<{ response?: ApiPlayerResponseRow[] }>("/players", {
      search: query,
    });
    const apiPlayers = (data?.response ?? [])
      .map(mapApiPlayerRowToProfile)
      .filter(Boolean) as PlayerProfile[];
    if (apiPlayers.length) return apiPlayers.slice(0, 20);
  }
  const mockPlayers = searchMockPlayers(query);
  return mockPlayers.slice(0, 20);
}
