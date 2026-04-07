import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/football-service";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const player = await getPlayer(id);
  if (!player) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ player });
}
