"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const { signInEmail, signUpEmail, signInGoogle, firebaseEnabled } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!firebaseEnabled) {
    return (
      <div className="surface mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-bold">Firebase not configured</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Add your web app keys from the Firebase console to{" "}
          <code className="rounded bg-[var(--background)] px-1">.env.local</code>
          .
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "signin") {
        await signInEmail(email, password);
      } else {
        await signUpEmail(email, password, name);
      }
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setPending(true);
    try {
      await signInGoogle();
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {mode === "signin"
            ? "Welcome back to Pitchside."
            : "Join to sync favorites across devices."}
        </p>
      </div>

      <div className="surface space-y-4 p-6">
        <button
          type="button"
          onClick={onGoogle}
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--card-border)] py-3 text-sm font-semibold hover:border-[var(--accent)] disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <span className="h-px flex-1 bg-[var(--card-border)]" />
          or email
          <span className="h-px flex-1 bg-[var(--card-border)]" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="text-xs font-medium text-[var(--muted)]">
                Display name
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-[var(--muted)]">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted)]">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-[#041208] disabled:opacity-50"
          >
            {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-[var(--muted)]">
        {mode === "signin" ? (
          <>
            No account?{" "}
            <Link href="/auth/signup" className="font-semibold text-[var(--accent)]">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-semibold text-[var(--accent)]">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
