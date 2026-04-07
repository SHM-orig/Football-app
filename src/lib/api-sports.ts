/**
 * Optional API-Sports (API-Football) integration.
 * Set API_FOOTBALL_KEY in .env.local — without it, the app uses demo data.
 */
const BASE = "https://v3.football.api-sports.io";

export function hasApiSportsKey(): boolean {
  return Boolean(process.env.API_FOOTBALL_KEY?.trim());
}

export async function apiSportsFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T | null> {
  const key = process.env.API_FOOTBALL_KEY?.trim();
  if (!key) return null;

  const url = new URL(path.startsWith("http") ? path : `${BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(url.toString(), {
      headers: { "x-apisports-key": key },
      next: { revalidate: 60 },
      signal: controller.signal,
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Network/DNS/timeout failures should not crash routes;
    // callers already handle null by falling back to other providers.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
