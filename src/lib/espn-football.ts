import type { LeagueRef, MatchStatus, MatchSummary } from "./types";

interface EspnTeam {
  id?: string;
  displayName?: string;
  shortDisplayName?: string;
  logo?: string;
}

interface EspnCompetition {
  id?: string;
  date?: string;
  venue?: { fullName?: string };
  status?: {
    type?: {
      completed?: boolean;
      state?: string;
      shortDetail?: string;
    };
  };
  competitors?: Array<{
    homeAway?: "home" | "away";
    score?: string;
    team?: EspnTeam;
  }>;
}

interface EspnLeague {
  id?: string;
  name?: string;
  shortName?: string;
  country?: string;
  logos?: Array<{ href?: string }>;
}

interface EspnEvent {
  id?: string;
  competitions?: EspnCompetition[];
  league?: EspnLeague;
}

interface EspnScoreboardResponse {
  events?: EspnEvent[];
  leagues?: EspnLeague[];
}

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer";

const LEAGUES = [
  "eng.1", // Premier League
  "esp.1", // La Liga
  "ger.1", // Bundesliga
  "ita.1", // Serie A
  "fra.1", // Ligue 1
  "uefa.champions", // Champions League
  "uefa.europa", // Europa League
  "uefa.europa.conf", // Conference League
  "por.1", // Primeira Liga
  "ned.1", // Eredivisie
  "bel.1", // Belgian Pro League
  "tur.1", // Super Lig
  "aut.1", // Austrian Bundesliga
  "sco.1", // Scottish Premiership
  "den.1", // Danish Superliga
  "nor.1", // Eliteserien
  "swe.1", // Allsvenskan
  "usa.1", // MLS
  "mex.1", // Liga MX
  "arg.1", // Primera Division
  "bra.1", // Brasileiro
  "conmebol.libertadores", // Copa Libertadores
];

function toEspnDate(date: string): string {
  return date.replaceAll("-", "");
}

function parseStatus(comp?: EspnCompetition): MatchStatus {
  const state = comp?.status?.type?.state?.toLowerCase();
  const completed = comp?.status?.type?.completed;
  if (completed || state === "post") return "finished";
  if (state === "in" || state === "halftime" || state === "in_progress") {
    return "live";
  }
  return "scheduled";
}

function toTeam(team?: EspnTeam) {
  return {
    id: String(team?.id ?? ""),
    name: team?.displayName ?? "Unknown Team",
    shortName: team?.shortDisplayName ?? undefined,
    logo: team?.logo ?? undefined,
  };
}

function scoreNum(v?: string): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapEventToMatch(event: EspnEvent, league?: EspnLeague): MatchSummary | null {
  const comp = event.competitions?.[0];
  if (!comp || !event.id) return null;
  const home = comp.competitors?.find((c) => c.homeAway === "home");
  const away = comp.competitors?.find((c) => c.homeAway === "away");
  if (!home || !away) return null;

  const status = parseStatus(comp);
  const shortDetail = comp.status?.type?.shortDetail?.trim();
  const minute =
    status === "live" && shortDetail ? shortDetail : null;

  const leagueSrc = event.league ?? league;
  return {
    id: String(event.id),
    league: {
      id: String(leagueSrc?.id ?? "espn"),
      name: leagueSrc?.name ?? leagueSrc?.shortName ?? "Football",
      country: leagueSrc?.country ?? "",
      logo: leagueSrc?.logos?.[0]?.href,
    },
    home: toTeam(home.team),
    away: toTeam(away.team),
    homeScore: scoreNum(home.score),
    awayScore: scoreNum(away.score),
    minute,
    status,
    kickoff: comp.date ?? new Date().toISOString(),
    venue: comp.venue?.fullName ?? undefined,
  };
}

async function fetchLeagueScoreboard(league: string, date: string): Promise<MatchSummary[]> {
  const url = new URL(`${ESPN_BASE}/${league}/scoreboard`);
  url.searchParams.set("dates", toEspnDate(date));
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = (await res.json()) as EspnScoreboardResponse;
  const leagueMeta = data.leagues?.[0];
  return (data.events ?? [])
    .map((e) => mapEventToMatch(e, leagueMeta))
    .filter(Boolean) as MatchSummary[];
}

export async function fetchEspnMatchesByDate(date: string): Promise<MatchSummary[]> {
  const all = await Promise.all(LEAGUES.map((l) => fetchLeagueScoreboard(l, date)));
  const out = all.flat();
  const seen = new Set<string>();
  return out.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

export function getEspnLeagues(): LeagueRef[] {
  return [
    { id: "eng.1", name: "Premier League", country: "England" },
    { id: "esp.1", name: "La Liga", country: "Spain" },
    { id: "ger.1", name: "Bundesliga", country: "Germany" },
    { id: "ita.1", name: "Serie A", country: "Italy" },
    { id: "fra.1", name: "Ligue 1", country: "France" },
    { id: "uefa.champions", name: "Champions League", country: "Europe" },
  ];
}
