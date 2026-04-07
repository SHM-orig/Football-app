import { NextResponse } from "next/server";
import { searchPlayers } from "@/lib/football-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const players = await searchPlayers(q);
  return NextResponse.json({ players });
}
