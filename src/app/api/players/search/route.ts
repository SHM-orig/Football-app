import { NextResponse } from "next/server";
import { searchPlayers } from "@/lib/football-service";
import { getPlayerIndexMeta } from "@/lib/player-index";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({
      players: [],
      error: "Type at least 2 characters.",
      source: "none",
    });
  }
  const players = await searchPlayers(q);
  const meta = await getPlayerIndexMeta();
  if (!players.length) {
    return NextResponse.json({
      players: [],
      error:
        meta.count > 0
          ? "No players matched your search."
          : "No players found. Run player index sync and try again.",
      source: meta.count > 0 ? "index" : "none",
      indexCount: meta.count,
      indexUpdatedAt: meta.updatedAt,
    });
  }
  return NextResponse.json({
    players,
    error: null,
    source: meta.count > 0 ? "index_or_api" : "api",
    indexCount: meta.count,
    indexUpdatedAt: meta.updatedAt,
  });
}
