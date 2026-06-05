import { getSql } from "@/lib/db";
import { MusicArtistResult, MusicProvider, MusicTrackResult } from "@/lib/types";

export type MusicSearchKind = "artist" | "track";
export type MusicSearchResultMap = {
  artist: MusicArtistResult[];
  track: MusicTrackResult[];
};

type CacheRow<T extends MusicSearchKind> = {
  results: MusicSearchResultMap[T];
};

const DB_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const DB_CACHE_STALE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export async function getCachedMusicSearch<T extends MusicSearchKind>(
  kind: T,
  cacheKey: string,
  options: { allowStale?: boolean; provider?: MusicProvider } = {}
): Promise<MusicSearchResultMap[T] | null> {
  try {
    const sql = getSql();
    const provider = options.provider ?? "spotify";
    const rows = (await sql(
      [
        "select results",
        "from music_search_cache",
        "where provider = $3",
        "and search_kind = $1",
        "and cache_key = $2",
        options.allowStale ? "and stale_until > now()" : "and expires_at > now()",
        "limit 1"
      ].join(" "),
      [kind, cacheKey, provider]
    )) as CacheRow<T>[];

    return rows[0]?.results ?? null;
  } catch {
    return null;
  }
}

export async function setCachedMusicSearch<T extends MusicSearchKind>(
  kind: T,
  cacheKey: string,
  results: MusicSearchResultMap[T],
  provider: MusicProvider = "spotify"
) {
  try {
    const sql = getSql();
    const expiresAt = new Date(Date.now() + DB_CACHE_TTL_MS).toISOString();
    const staleUntil = new Date(Date.now() + DB_CACHE_STALE_TTL_MS).toISOString();

    await sql(
      [
        "insert into music_search_cache",
        "(provider, search_kind, cache_key, results, expires_at, stale_until)",
        "values ($6, $1, $2, $3::jsonb, $4, $5)",
        "on conflict (provider, search_kind, cache_key) do update set",
        "results = excluded.results,",
        "expires_at = excluded.expires_at,",
        "stale_until = excluded.stale_until,",
        "updated_at = now()"
      ].join(" "),
      [kind, cacheKey, JSON.stringify(results), expiresAt, staleUntil, provider]
    );
  } catch {
    // Cache writes should never block search results.
  }
}
