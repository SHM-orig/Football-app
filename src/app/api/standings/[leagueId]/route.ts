import { NextResponse } from "next/server";
import { getStandings } from "@/lib/football-service";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ leagueId: string }> },
) {
  const { leagueId } = await ctx.params;
  const standings = await getStandings(leagueId);
  return NextResponse.json({ standings });
}
