import type { MatchSummary } from "@/lib/types";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

function TeamBlock({
  team,
  align,
}: {
  team: MatchSummary["home"];
  align: "left" | "right";
}) {
  return (
    <div
      className={clsx(
        "flex min-w-0 flex-1 items-center gap-2",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      {team.logo ? (
        <Image
          src={team.logo}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 object-contain"
          unoptimized
        />
      ) : (
        <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--background)]" />
      )}
      <span className="truncate text-sm font-semibold sm:text-base">
        {team.name}
      </span>
    </div>
  );
}

export function MatchCard({ match }: { match: MatchSummary }) {
  const time = format(parseISO(match.kickoff), "HH:mm");
  const dateLabel = format(parseISO(match.kickoff), "d MMM");

  return (
    <Link
      href={`/match/${match.id}`}
      className="surface block p-4 transition hover:ring-1 hover:ring-[var(--accent)]/40"
    >
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <span className="truncate">
          {match.league.name}
          {match.league.country ? ` · ${match.league.country}` : ""}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {match.status === "live" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--live)]/15 px-2 py-0.5 font-semibold text-[var(--live)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--live)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--live)]" />
              </span>
              LIVE {match.minute ? match.minute : ""}
            </span>
          )}
          {match.status === "scheduled" && (
            <span>
              {dateLabel} {time}
            </span>
          )}
          {match.status === "finished" && (
            <span className="rounded-full bg-[var(--background)] px-2 py-0.5 font-medium">
              FT
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <TeamBlock team={match.home} align="left" />
        <div className="flex shrink-0 flex-col items-center px-2">
          {match.status === "scheduled" ? (
            <span className="text-lg font-bold text-[var(--muted)]">vs</span>
          ) : (
            <span className="text-xl font-black tabular-nums tracking-tight sm:text-2xl">
              {match.homeScore ?? 0}
              <span className="mx-1 text-[var(--muted)]">:</span>
              {match.awayScore ?? 0}
            </span>
          )}
        </div>
        <TeamBlock team={match.away} align="right" />
      </div>
      {match.venue && (
        <p className="mt-2 truncate text-xs text-[var(--muted)]">{match.venue}</p>
      )}
    </Link>
  );
}
