import type { PlayerProfile } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export function PlayerCard({ player }: { player: PlayerProfile }) {
  return (
    <Link
      href={`/player/${player.id}`}
      className="surface flex items-center gap-3 p-3 transition hover:ring-1 hover:ring-[var(--accent)]/40 sm:p-4"
    >
      {player.photo ? (
        <Image
          src={player.photo}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover"
          unoptimized
        />
      ) : (
        <div className="h-14 w-14 rounded-full bg-[var(--background)]" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{player.name}</p>
        <p className="truncate text-sm text-[var(--muted)]">
          {player.team?.name}
          {player.position ? ` · ${player.position}` : ""}
        </p>
      </div>
      <div className="text-right text-sm">
        <p className="font-bold text-[var(--accent)]">{player.stats.goals} G</p>
        <p className="text-[var(--muted)]">{player.stats.assists} A</p>
      </div>
    </Link>
  );
}
