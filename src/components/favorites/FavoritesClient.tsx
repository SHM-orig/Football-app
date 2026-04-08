"use client";

import { PlayerCard } from "@/components/player/PlayerCard";
import { FavoriteStar } from "@/components/ui/FavoriteStar";
import { useAuth } from "@/contexts/AuthContext";
import type { MatchSummary, PlayerProfile } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type TeamLite = { id: string; name: string; logo?: string };

export function FavoritesClient() {
  const { user, firebaseEnabled, profile, loading } = useAuth();
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [teams, setTeams] = useState<Record<string, TeamLite>>({});

  useEffect(() => {
    const favoriteIds = profile?.favoritePlayerIds ?? [];
    let cancelled = false;
    (async () => {
      setLoadingPlayers(true);
      const results = await Promise.all(
        favoriteIds.map(async (id) => {
          const res = await fetch(`/api/players/${id}`);
          if (!res.ok) return null;
          const j = await res.json();
          return j.player as PlayerProfile;
        }),
      );
      if (!cancelled) {
        setPlayers(results.filter(Boolean) as PlayerProfile[]);
        setLoadingPlayers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.favoritePlayerIds]);

  useEffect(() => {
    const teamIds = profile?.favoriteTeamIds ?? [];
    if (teamIds.length === 0) {
      setTeams({});
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/matches?tab=all");
      if (!res.ok) return;
      const json = (await res.json()) as { matches?: MatchSummary[] };
      const byId: Record<string, TeamLite> = {};
      for (const m of json.matches ?? []) {
        byId[m.home.id] = { id: m.home.id, name: m.home.name, logo: m.home.logo };
        byId[m.away.id] = { id: m.away.id, name: m.away.name, logo: m.away.logo };
      }
      if (!cancelled) setTeams(byId);
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.favoriteTeamIds]);

  if (!firebaseEnabled) {
    return (
      <div className="surface p-8 text-center text-[var(--muted)]">
        <p>Add Firebase environment variables to enable favorites sync.</p>
        <p className="mt-2 text-sm">
          See <code className="rounded bg-[var(--background)] px-1">.env.example</code>{" "}
          in the project root.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="surface p-10 text-center text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="surface space-y-4 p-8 text-center">
        <p className="text-[var(--muted)]">Sign in to view saved teams and players.</p>
        <Link
          href="/auth/signin"
          className="inline-flex rounded-xl bg-[var(--accent)] px-6 py-2 font-semibold text-[#041208]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const teamIds = profile?.favoriteTeamIds ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Favorites</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Teams and players you follow across the app.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Teams</h2>
        {teamIds.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No favorite teams yet. Tap the star on a match or lineup.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {teamIds.map((id) => {
              const team = teams[id];
              return (
              <li
                key={id}
                className="surface flex items-center gap-2 px-3 py-2 text-sm"
              >
                {team?.logo ? (
                  <Image
                    src={team.logo}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="h-[18px] w-[18px] rounded-full bg-[var(--background)]" />
                )}
                <span className="max-w-[180px] truncate font-medium">
                  {team?.name ?? id}
                </span>
                <FavoriteStar kind="team" id={id} />
              </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Players</h2>
        {loadingPlayers && (
          <p className="text-sm text-[var(--muted)]">Loading players…</p>
        )}
        {!loadingPlayers && players.length === 0 && (
          <p className="text-sm text-[var(--muted)]">
            No favorite players. Open a profile and tap the star.
          </p>
        )}
        <ul className="grid gap-3 sm:grid-cols-2">
          {players.map((p) => (
            <li key={p.id}>
              <PlayerCard player={p} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
