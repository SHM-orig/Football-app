import { MatchDetailView } from "@/components/match/MatchDetailView";
import Link from "next/link";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)]"
      >
        ← Back to matches
      </Link>
      <MatchDetailView id={id} />
    </div>
  );
}
