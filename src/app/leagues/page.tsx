import { listLeagues } from "@/lib/football-service";
import Image from "next/image";
import Link from "next/link";

export default async function LeaguesPage() {
  const leagues = await listLeagues();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Leagues</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Open a league to view the full table.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {leagues.map((l) => (
          <li key={l.id}>
            <Link
              href={`/league/${l.id}`}
              className="surface flex min-h-20 items-center gap-3 p-4 transition hover:ring-1 hover:ring-[var(--accent)]/40"
            >
              {l.logo ? (
                <Image
                  src={l.logo}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                  unoptimized
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-[var(--background)]" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate whitespace-nowrap font-semibold">{l.name}</p>
                <p className="truncate text-sm text-[var(--muted)]">
                  {l.country}
                  {l.season ? ` · ${l.season}` : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
