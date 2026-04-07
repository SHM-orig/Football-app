import { NextResponse } from "next/server";
import { listLeagues } from "@/lib/football-service";

export async function GET() {
  const leagues = await listLeagues();
  return NextResponse.json({ leagues });
}
