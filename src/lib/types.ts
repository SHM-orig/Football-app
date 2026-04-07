export type MatchStatus = "live" | "scheduled" | "finished";

export interface TeamRef {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
}

export interface LeagueRef {
  id: string;
  name: string;
  country: string;
  logo?: string;
  season?: string;
}

export interface MatchSummary {
  id: string;
  league: LeagueRef;
  home: TeamRef;
  away: TeamRef;
  homeScore: number | null;
  awayScore: number | null;
  minute: string | null;
  status: MatchStatus;
  kickoff: string;
  venue?: string;
}

export type TimelineEventType = "goal" | "card" | "subst" | "var" | "period";

export interface TimelineEvent {
  id: string;
  minute: string;
  type: TimelineEventType;
  team: "home" | "away";
  detail: string;
  player?: string;
  assist?: string;
}

export interface LineupPlayer {
  id: string;
  name: string;
  number: number;
  pos: string;
  isCaptain?: boolean;
}

export interface TeamLineup {
  starting: LineupPlayer[];
  substitutes: LineupPlayer[];
  formation?: string;
}

export interface MatchStatRow {
  label: string;
  home: number;
  away: number;
}

export interface MatchDetail extends MatchSummary {
  timeline: TimelineEvent[];
  lineups: { home: TeamLineup; away: TeamLineup };
  stats: MatchStatRow[];
}

export interface StandingRow {
  rank: number;
  team: TeamRef;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form?: string[];
}

export interface PlayerProfile {
  id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  nationality?: string;
  photo?: string;
  team?: TeamRef;
  position?: string;
  marketValue: string;
  stats: {
    appearances: number;
    goals: number;
    assists: number;
    minutes: number;
    rating: string;
    yellowCards: number;
    redCards: number;
  };
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  favoriteTeamIds: string[];
  favoritePlayerIds: string[];
}
