import { NextResponse } from "next/server";
import { listMatches } from "@/lib/football-service";
import type { MatchTab } from "@/lib/filter-matches";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tab = (searchParams.get("tab") ?? "all") as MatchTab;
  const leagueId = searchParams.get("leagueId");
  const date = searchParams.get("date");
  const search = searchParams.get("q");

  const matches = await listMatches({
    tab: tab === "live" || tab === "upcoming" || tab === "finished" ? tab : "all",
    leagueId,
    date,
    search,
  });

  return NextResponse.json({ matches });
}
