import { promises as fs } from "node:fs";
import path from "node:path";
import type { PlayerProfile } from "./types";

interface PlayerIndexFile {
  updatedAt: string;
  players: PlayerProfile[];
}

const INDEX_PATH = path.join(process.cwd(), "data", "player-index.json");

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

async function readIndex(): Promise<PlayerIndexFile> {
  try {
    const raw = await fs.readFile(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw) as PlayerIndexFile;
    if (!Array.isArray(parsed.players)) {
      return { updatedAt: "", players: [] };
    }
    return parsed;
  } catch {
    return { updatedAt: "", players: [] };
  }
}

export async function searchIndexedPlayers(query: string): Promise<PlayerProfile[]> {
  const q = normalize(query.trim());
  if (!q) return [];
  const { players } = await readIndex();
  if (!players.length) return [];

  const ranked = players
    .map((p) => {
      const hay = normalize(
        `${p.name} ${p.firstname ?? ""} ${p.lastname ?? ""} ${p.team?.name ?? ""} ${p.nationality ?? ""}`,
      );
      const starts = hay.startsWith(q) ? 2 : 0;
      const has = hay.includes(q) ? 1 : 0;
      return { p, score: starts + has };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
    .slice(0, 40)
    .map((x) => x.p);

  return ranked;
}

export async function getIndexedPlayerById(id: string): Promise<PlayerProfile | null> {
  if (!id) return null;
  const { players } = await readIndex();
  return players.find((p) => p.id === id) ?? null;
}

export async function getPlayerIndexMeta(): Promise<{ updatedAt: string; count: number }> {
  const { players, updatedAt } = await readIndex();
  return { updatedAt, count: players.length };
}
