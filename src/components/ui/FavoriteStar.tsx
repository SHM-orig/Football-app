"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Star } from "lucide-react";
import Link from "next/link";

type Props = {
  kind: "team" | "player";
  id: string;
  className?: string;
};

export function FavoriteStar({ kind, id, className }: Props) {
  const {
    user,
    firebaseEnabled,
    toggleFavoriteTeam,
    toggleFavoritePlayer,
    isFavoriteTeam,
    isFavoritePlayer,
  } = useAuth();

  const active =
    kind === "team" ? isFavoriteTeam(id) : isFavoritePlayer(id);

  if (!firebaseEnabled) {
    return (
      <Link
        href="/auth/signin"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-[var(--card-border)] text-[var(--muted)] ${className ?? ""}`}
        title="Enable Firebase to save favorites"
      >
        <Star className="h-4 w-4" />
      </Link>
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--accent)] ${className ?? ""}`}
        title="Sign in to save favorites"
      >
        <Star className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        kind === "team" ? toggleFavoriteTeam(id) : toggleFavoritePlayer(id)
      }
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--card-border)] transition hover:border-[var(--accent)] ${className ?? ""}`}
      aria-pressed={active}
      title={active ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        className={`h-4 w-4 ${active ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--muted)]"}`}
      />
    </button>
  );
}
