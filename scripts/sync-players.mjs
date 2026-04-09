import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const k = trimmed.slice(0, eq).trim();
      const v = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {
    // no-op when .env.local does not exist
  }
}

loadEnvLocal();

const key = process.env.API_FOOTBALL_KEY?.trim();
if (!key) {
  console.error("Missing API_FOOTBALL_KEY");
  process.exit(1);
}

const BASE = "https://v3.football.api-sports.io";
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const season = new Date().getFullYear();
const leagueIds = [39, 140, 2, 203, 78, 135, 61];

async function api(pathname, params = {}) {
  const url = new URL(`${BASE}${pathname}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": key },
  });
  if (!res.ok) {
    throw new Error(`API ${pathname} failed: ${res.status}`);
  }
  const data = await res.json();
  if (data?.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API ${pathname} errors: ${JSON.stringify(data.errors)}`);
  }
  return data;
}

function toProfile(player, team) {
  if (!player?.id || !player?.name) return null;
  return {
    id: String(player.id),
    name: player.name,
    firstname: player.firstname ?? "",
    lastname: player.lastname ?? "",
    age: player.age,
    nationality: player.nationality ?? "",
    photo: player.photo,
    team: team?.id
      ? {
          id: String(team.id),
          name: team.name ?? "Unknown Team",
          logo: team.logo,
        }
      : undefined,
    position: player.position ?? "",
    marketValue: "—",
    stats: {
      appearances: 0,
      goals: 0,
      assists: 0,
      minutes: 0,
      rating: "—",
      yellowCards: 0,
      redCards: 0,
    },
  };
}

async function main() {
  const map = new Map();
  let hitRateLimit = false;
  const seasons = [season, season - 1, season - 2, season - 3].filter(
    (s, i, arr) => s >= 2022 && arr.indexOf(s) === i
  );
  for (const leagueId of leagueIds) {
    if (hitRateLimit) break;
    for (const s of seasons) {
      let teamsData;
      try {
        teamsData = await api("/teams", { league: leagueId, season: s });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("request limit for the day")) {
          hitRateLimit = true;
          break;
        }
        if (message.includes("Free plans do not have access to this season")) {
          continue;
        }
        throw err;
      }
      const teams = teamsData?.response ?? [];
      for (const tRow of teams) {
        const team = tRow?.team;
        if (!team?.id) continue;
        let squadData;
        try {
          squadData = await api("/players/squads", { team: team.id });

          await delay(7000);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes("request limit for the day")) {
            hitRateLimit = true;
            break;
          }
          continue;
        }
        const squads = squadData?.response ?? [];
        for (const squad of squads) {
          const players = squad?.players ?? [];
          for (const player of players) {
            const profile = toProfile(player, team);
            if (profile) map.set(profile.id, profile);
          }
        }
      }
      if (map.size > 1500) break;
      if (hitRateLimit) break;
    }
  }

  const out = {
    updatedAt: new Date().toISOString(),
    players: [...map.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };

  const dataDir = path.join(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });
  await writeFile(
    path.join(dataDir, "player-index.json"),
    `${JSON.stringify(out, null, 2)}\n`,
    "utf8"
  );
  console.log(`Synced ${out.players.length} players.`);
  if (out.players.length === 0) {
    console.log(
      "No players returned. Your API plan/key may not include players endpoints for these leagues."
    );
  }
  if (hitRateLimit) {
    console.log(
      "Stopped early because daily API request limit was reached. Run again tomorrow."
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
