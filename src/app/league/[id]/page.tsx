import { LeagueTable } from "@/components/league/LeagueTable";
import { getStandings, listLeagues } from "@/lib/football-service";
import Link from "next/link";

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [standings, leagues] = await Promise.all([
    getStandings(id),
    listLeagues(),
  ]);
  const league = leagues.find((l) => l.id === id);

  return (
    <div className="space-y-6">
      <Link
        href="/leagues"
        className="inline-flex text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)]"
      >
        ← All leagues
      </Link>
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {league?.name ?? "League"} table
        </h1>
        {league?.country && (
          <p className="mt-1 text-sm text-[var(--muted)]">{league.country}</p>
        )}
      </div>
      {standings.length > 0 ? (
        <LeagueTable rows={standings} />
      ) : (
        <div className="surface p-8 text-sm text-[var(--muted)]">
          Standings are currently unavailable for this league.
        </div>
      )}
    </div>
  );
}
