import type { MatchSummary } from "@/lib/types";
import { MatchCard } from "./MatchCard";

export function MatchList({ matches }: { matches: MatchSummary[] }) {
  if (!matches.length) {
    return (
      <div className="surface p-10 text-center text-[var(--muted)]">
        No matches for these filters.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {matches.map((m) => (
        <li key={m.id}>
          <MatchCard match={m} />
        </li>
      ))}
    </ul>
  );
}
