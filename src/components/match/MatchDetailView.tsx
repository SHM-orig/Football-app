"use client";

import { FavoriteStar } from "@/components/ui/FavoriteStar";
import type { MatchDetail } from "@/lib/types";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import clsx from "clsx";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("fail");
    return r.json();
  });

function StatBar({
  label,
  home,
  away,
}: {
  label: string;
  home: number;
  away: number;
}) {
  const total = home + away || 1;
  const hp = Math.round((home / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs tabular-nums text-[var(--muted)]">
        <span>{home}</span>
        <span className="font-medium text-[var(--foreground)]">{label}</span>
        <span>{away}</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-[var(--background)]">
        <div
          className="bg-[var(--accent)] transition-all"
          style={{ width: `${hp}%` }}
        />
        <div className="flex-1 bg-slate-400/25" />
      </div>
    </div>
  );
}

function LineupSide({
  title,
  lineup,
  teamId,
}: {
  title: string;
  lineup: MatchDetail["lineups"]["home"];
  teamId: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <FavoriteStar kind="team" id={teamId} />
      </div>
      {lineup.formation && (
        <p className="text-xs text-[var(--muted)]">
          Formation {lineup.formation}
        </p>
      )}
      <ul className="space-y-2">
        {lineup.starting.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-xl bg-[var(--background)] px-3 py-2 text-sm"
          >
            <Link
              href={`/search?q=${encodeURIComponent(p.name)}`}
              className="min-w-0 truncate font-medium hover:text-[var(--accent)]"
            >
              <span className="text-[var(--muted)]">{p.number}</span>{" "}
              {p.name}
              {p.isCaptain ? " (c)" : ""}
            </Link>
            <span className="shrink-0 text-xs text-[var(--muted)]">{p.pos}</span>
          </li>
        ))}
      </ul>
      {lineup.substitutes.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Bench
          </p>
          <ul className="space-y-1">
            {lineup.substitutes.map((p) => (
              <li key={p.id} className="text-sm text-[var(--muted)]">
                <Link
                  href={`/search?q=${encodeURIComponent(p.name)}`}
                  className="hover:text-[var(--accent)]"
                >
                  {p.number}. {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Timeline({ events }: { events: MatchDetail["timeline"] }) {
  return (
    <ol className="relative space-y-4 border-l border-[var(--card-border)] pl-6">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[29px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card)] text-[10px] font-bold text-[var(--muted)]" />
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xs font-bold text-[var(--accent)]">
              {e.minute}
            </span>
            <span
              className={clsx(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                e.team === "home"
                  ? "bg-blue-500/15 text-blue-500"
                  : "bg-orange-500/15 text-orange-500",
              )}
            >
              {e.team}
            </span>
            <span className="text-sm font-medium">{e.detail}</span>
          </div>
          {e.player && (
            <p className="text-sm text-[var(--muted)]">{e.player}</p>
          )}
          {e.assist && (
            <p className="text-xs text-[var(--muted)]">Assist: {e.assist}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

export function MatchDetailView({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR<{ match: MatchDetail }>(
    `/api/matches/${id}`,
    fetcher,
    { refreshInterval: 30_000 },
  );

  if (isLoading && !data) {
    return (
      <div className="surface p-10 text-center text-[var(--muted)]">
        Loading match…
      </div>
    );
  }
  if (error || !data?.match) {
    return (
      <div className="surface p-10 text-center text-red-500">
        Match not found.
      </div>
    );
  }

  const m = data.match;
  const kickoff = format(parseISO(m.kickoff), "EEE d MMM yyyy · HH:mm");

  return (
    <div className="space-y-8">
      <div className="surface overflow-hidden p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
          <span>
            {m.league.name}
            {m.league.country ? ` · ${m.league.country}` : ""}
          </span>
          {m.status === "live" && (
            <span className="font-semibold text-[var(--live)]">
              LIVE {m.minute ?? ""}
            </span>
          )}
          {m.status === "finished" && (
            <span className="rounded-full bg-[var(--background)] px-2 py-1 font-medium">
              Full time
            </span>
          )}
          {m.status === "scheduled" && (
            <span className="font-medium">{kickoff}</span>
          )}
        </div>

        <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            {m.home.logo ? (
              <Image
                src={m.home.logo}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
                unoptimized
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[var(--background)]" />
            )}
            <div>
              <p className="text-lg font-bold sm:text-xl">{m.home.name}</p>
              <FavoriteStar kind="team" id={m.home.id} className="mt-2" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-4">
            {m.status === "scheduled" ? (
              <span className="text-2xl font-black text-[var(--muted)]">vs</span>
            ) : (
              <span className="text-4xl font-black tabular-nums sm:text-5xl">
                {m.homeScore ?? 0}
                <span className="mx-2 text-[var(--muted)]">:</span>
                {m.awayScore ?? 0}
              </span>
            )}
            <p className="mt-2 text-center text-xs text-[var(--muted)]">
              {kickoff}
            </p>
          </div>

          <div className="flex flex-1 flex-row-reverse items-center gap-4 sm:flex-row sm:justify-end">
            {m.away.logo ? (
              <Image
                src={m.away.logo}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
                unoptimized
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[var(--background)]" />
            )}
            <div className="text-right sm:text-left">
              <p className="text-lg font-bold sm:text-xl">{m.away.name}</p>
              <div className="mt-2 flex justify-end sm:justify-start">
                <FavoriteStar kind="team" id={m.away.id} />
              </div>
            </div>
          </div>
        </div>
        {m.venue && (
          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            {m.venue}
          </p>
        )}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface p-6">
          <h2 className="mb-4 text-lg font-bold">Timeline</h2>
          <Timeline events={m.timeline} />
        </div>
        <div className="surface p-6">
          <h2 className="mb-4 text-lg font-bold">Statistics</h2>
          <div className="space-y-4">
            {m.stats.map((s) => (
              <StatBar
                key={s.label}
                label={s.label}
                home={s.home}
                away={s.away}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="surface p-6">
        <h2 className="mb-6 text-lg font-bold">Lineups</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <LineupSide
            title={m.home.name}
            lineup={m.lineups.home}
            teamId={m.home.id}
          />
          <LineupSide
            title={m.away.name}
            lineup={m.lineups.away}
            teamId={m.away.id}
          />
        </div>
      </section>
    </div>
  );
}
