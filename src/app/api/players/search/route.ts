import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";

  if (query.trim().length < 2) {
    return NextResponse.json({
      players: [],
      error: "Type at least 2 characters.",
    });
  }

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/players?search=${query}&season=2024`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY!,
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    const players = (data.response || []).map((item: any) => ({
      id: String(item.player.id),
      name: item.player.name,
      firstname: item.player.firstname,
      lastname: item.player.lastname,
      age: item.player.age,
      nationality: item.player.nationality,
      photo: item.player.photo,
      team: item.statistics?.[0]?.team
        ? {
            id: String(item.statistics[0].team.id),
            name: item.statistics[0].team.name,
            logo: item.statistics[0].team.logo,
          }
        : undefined,
      position: item.statistics?.[0]?.games?.position || "",
      marketValue: "—",
      stats: {
        appearances: item.statistics?.[0]?.games?.appearences || 0,
        goals: item.statistics?.[0]?.goals?.total || 0,
        assists: item.statistics?.[0]?.goals?.assists || 0,
        minutes: item.statistics?.[0]?.games?.minutes || 0,
        rating: item.statistics?.[0]?.games?.rating || "—",
        yellowCards: item.statistics?.[0]?.cards?.yellow || 0,
        redCards: item.statistics?.[0]?.cards?.red || 0,
      },
    }));

    return NextResponse.json({
      players,
      error: players.length ? null : "No players found.",
    });
  } catch {
    return NextResponse.json({
      players: [],
      error: "API error. Try again.",
    });
  }
}