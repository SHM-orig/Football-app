import { PlayerProfileView } from "@/components/player/PlayerProfileView";
import Link from "next/link";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <Link
        href="/search"
        className="inline-flex text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)]"
      >
        ← Search players
      </Link>
      <PlayerProfileView id={id} />
    </div>
  );
}
