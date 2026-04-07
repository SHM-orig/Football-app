import type { StandingRow } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export function LeagueTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="surface overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Team</th>
            <th className="px-4 py-3 font-medium">P</th>
            <th className="px-4 py-3 font-medium">W</th>
            <th className="px-4 py-3 font-medium">D</th>
            <th className="px-4 py-3 font-medium">L</th>
            <th className="px-4 py-3 font-medium">GF</th>
            <th className="px-4 py-3 font-medium">GA</th>
            <th className="px-4 py-3 font-medium">Pts</th>
            <th className="px-4 py-3 font-medium">Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.team.id}
              className="border-b border-[var(--card-border)]/60 last:border-0"
            >
              <td className="px-4 py-3 font-semibold tabular-nums">{r.rank}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/search?q=${encodeURIComponent(r.team.name)}`}
                  className="flex items-center gap-2 font-medium hover:text-[var(--accent)]"
                >
                  {r.team.logo ? (
                    <Image
                      src={r.team.logo}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-[var(--background)]" />
                  )}
                  <span className="truncate">{r.team.name}</span>
                </Link>
              </td>
              <td className="px-4 py-3 tabular-nums text-[var(--muted)]">
                {r.played}
              </td>
              <td className="px-4 py-3 tabular-nums">{r.won}</td>
              <td className="px-4 py-3 tabular-nums">{r.drawn}</td>
              <td className="px-4 py-3 tabular-nums">{r.lost}</td>
              <td className="px-4 py-3 tabular-nums">{r.goalsFor}</td>
              <td className="px-4 py-3 tabular-nums">{r.goalsAgainst}</td>
              <td className="px-4 py-3 font-bold tabular-nums">{r.points}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  {(r.form ?? []).slice(-5).map((c, i) => (
                    <span
                      key={i}
                      className={clsx(
                        "flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold",
                        c === "W" && "bg-emerald-500/20 text-emerald-500",
                        c === "D" && "bg-amber-500/20 text-amber-500",
                        c === "L" && "bg-red-500/20 text-red-500",
                      )}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
