"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Menu, Trophy, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Matches" },
  { href: "/leagues", label: "Leagues" },
  { href: "/search", label: "Search" },
  { href: "/favorites", label: "Favorites" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logOut, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--card)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-[var(--foreground)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[#041208]">
            <Trophy className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">Pitchside</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "rounded-xl px-3 py-2 text-sm font-medium transition",
                pathname === l.href
                  ? "bg-[var(--background)] text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!loading && (
            <>
              {user ? (
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="max-w-[140px] truncate text-sm text-[var(--muted)]">
                    {user.displayName || user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => logOut()}
                    className="rounded-xl border border-[var(--card-border)] px-3 py-2 text-sm hover:border-[var(--accent)]"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="hidden rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#041208] sm:inline-flex"
                >
                  Sign in
                </Link>
              )}
            </>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--card-border)] md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--card-border)] bg-[var(--card)] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "rounded-xl px-3 py-2 text-sm font-medium",
                  pathname === l.href
                    ? "bg-[var(--background)]"
                    : "text-[var(--muted)]",
                )}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logOut();
                }}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm"
              >
                <User className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/signin"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-[var(--accent)] px-3 py-2 text-center text-sm font-semibold text-[#041208]"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
