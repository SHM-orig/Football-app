"use client";

import { FavoriteStar } from "@/components/ui/FavoriteStar";
import type { PlayerProfile } from "@/lib/types";
import Image from "next/image";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("fail");
    return r.json();
  });

export function PlayerProfileView({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR<{ player: PlayerProfile }>(
    `/api/players/${id}`,
    fetcher,
  );

  if (isLoading && !data) {
    return (
      <div className="surface p-10 text-center text-[var(--muted)]">
        Loading player…
      </div>
    );
  }
  if (error || !data?.player) {
    return (
      <div className="surface p-10 text-center text-red-500">
        Player not found.
      </div>
    );
  }

  const p = data.player;
  const s = p.stats;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="surface p-6 lg:col-span-1">
        <div className="flex flex-col items-center text-center">
          {p.photo ? (
            <Image
              src={p.photo}
              alt=""
              width={120}
              height={120}
              className="h-28 w-28 rounded-full object-cover sm:h-32 sm:w-32"
              unoptimized
            />
          ) : (
            <div className="h-28 w-28 rounded-full bg-[var(--background)] sm:h-32 sm:w-32" />
          )}
          <h1 className="mt-4 text-2xl font-bold">{p.name}</h1>
          <p className="text-sm text-[var(--muted)]">
            {p.nationality}
            {p.age ? ` · ${p.age} yrs` : ""}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{p.position}</p>
          {p.team && (
            <p className="mt-2 text-sm font-medium">{p.team.name}</p>
          )}
          <div className="mt-4">
            <FavoriteStar kind="player" id={p.id} />
          </div>
          <p className="mt-6 text-sm text-[var(--muted)]">Market value</p>
          <p className="text-2xl font-black text-[var(--accent)]">
            {p.marketValue}
          </p>
        </div>
      </div>

      <div className="surface p-6 lg:col-span-2">
        <h2 className="text-lg font-bold">Season stats</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Appearances", value: s.appearances },
            { label: "Goals", value: s.goals },
            { label: "Assists", value: s.assists },
            { label: "Minutes", value: s.minutes },
            { label: "Avg rating", value: s.rating },
            { label: "Yellow cards", value: s.yellowCards },
            { label: "Red cards", value: s.redCards },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-2xl bg-[var(--background)] px-4 py-4"
            >
              <p className="text-xs font-medium text-[var(--muted)]">
                {row.label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
