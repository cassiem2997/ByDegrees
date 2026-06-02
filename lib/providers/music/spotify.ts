import { assertServerEnv } from "@/lib/config";
import { getCachedMusicSearch, setCachedMusicSearch } from "@/lib/db/music-search-cache";
import { MusicArtistResult, MusicTrackResult } from "@/lib/types";
import { MusicProvider } from "@/lib/providers/music/types";

type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type SpotifySearchResponse = {
  tracks: {
    items: Array<{
      id: string;
      name: string;
      preview_url: string | null;
      external_urls: { spotify: string };
      album: {
        name: string;
        images: Array<{ url: string }>;
      };
      artists: Array<{ name: string }>;
    }>;
  };
};

type SpotifyArtistSearchResponse = {
  artists: {
    items: Array<{
      id: string;
      name: string;
      external_urls?: { spotify?: string };
      followers?: { total?: number };
      genres?: string[];
      images?: Array<{ url: string }>;
    }>;
  };
};

let cachedToken: { value: string; expiresAt: number } | null = null;

const SEARCH_CACHE_TTL_MS = 60 * 60 * 1000;
const SEARCH_CACHE_STALE_TTL_MS = 6 * 60 * 60 * 1000;

type SearchCacheEntry<T> = {
  value: T;
  expiresAt: number;
  staleUntil: number;
};

const searchCache = new Map<string, SearchCacheEntry<unknown>>();

export class SpotifyRateLimitError extends Error {
  retryAfterSeconds: number | null;

  constructor(retryAfterSeconds: number | null) {
    super("Spotify search rate limit exceeded");
    this.name = "SpotifyRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function isSpotifyRateLimitError(error: unknown): error is SpotifyRateLimitError {
  return error instanceof SpotifyRateLimitError;
}

function normalizeCachePart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getCachedSearch<T>(key: string, allowStale = false): T | null {
  const entry = searchCache.get(key) as SearchCacheEntry<T> | undefined;
  if (!entry) return null;

  const now = Date.now();
  if (entry.expiresAt > now || (allowStale && entry.staleUntil > now)) {
    return entry.value;
  }

  searchCache.delete(key);
  return null;
}

function setCachedSearch<T>(key: string, value: T) {
  const now = Date.now();
  searchCache.set(key, {
    value,
    expiresAt: now + SEARCH_CACHE_TTL_MS,
    staleUntil: now + SEARCH_CACHE_STALE_TTL_MS
  });
}

function getRetryAfterSeconds(response: Response) {
  const retryAfter = response.headers.get("Retry-After");
  if (!retryAfter) return null;

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds)) return Math.max(0, seconds);

  const retryAt = Date.parse(retryAfter);
  if (Number.isNaN(retryAt)) return null;

  return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
}

async function fetchSpotify(
  url: string,
  options: RequestInit,
  retries = 2
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);

      if (![502, 503, 504].includes(response.status) || attempt === retries) {
        return response;
      }

      lastError = new Error(`Spotify returned ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        throw error;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
  }

  throw lastError instanceof Error ? lastError : new Error("Spotify request failed");
}

async function getSpotifyToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value;
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = assertServerEnv();
  const credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token");
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  cachedToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000
  };

  return data.access_token;
}

export class SpotifyMusicProvider implements MusicProvider {
  async searchArtists(query: string): Promise<MusicArtistResult[]> {
    const cacheKey = `artist:${normalizeCachePart(query)}`;
    const cached = getCachedSearch<MusicArtistResult[]>(cacheKey);
    if (cached) return cached;

    const dbCached = await getCachedMusicSearch("artist", cacheKey);
    if (dbCached) {
      setCachedSearch(cacheKey, dbCached);
      return dbCached;
    }

    const token = await getSpotifyToken();
    const params = new URLSearchParams({
      q: query,
      type: "artist",
      limit: "10",
      market: "KR"
    });

    const response = await fetchSpotify(
      `https://api.spotify.com/v1/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: "no-store"
      }
    );

    if (response.status === 429) {
      const stale = getCachedSearch<MusicArtistResult[]>(cacheKey, true);
      if (stale) return stale;

      const dbStale = await getCachedMusicSearch("artist", cacheKey, {
        allowStale: true
      });
      if (dbStale) {
        setCachedSearch(cacheKey, dbStale);
        return dbStale;
      }

      throw new SpotifyRateLimitError(getRetryAfterSeconds(response));
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spotify artist search failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as SpotifyArtistSearchResponse;

    const artists: MusicArtistResult[] = data.artists.items.map((artist) => ({
      provider: "spotify",
      providerArtistId: artist.id,
      name: artist.name,
      imageUrl: artist.images?.[0]?.url ?? "",
      externalUrl: artist.external_urls?.spotify ?? "",
      followerCount: artist.followers?.total ?? 0,
      genres: artist.genres ?? []
    }));

    setCachedSearch(cacheKey, artists);
    await setCachedMusicSearch("artist", cacheKey, artists);
    return artists;
  }

  async searchTracks(query: string): Promise<MusicTrackResult[]> {
    const cacheKey = `track:${normalizeCachePart(query)}`;
    const cached = getCachedSearch<MusicTrackResult[]>(cacheKey);
    if (cached) return cached;

    const dbCached = await getCachedMusicSearch("track", cacheKey);
    if (dbCached) {
      setCachedSearch(cacheKey, dbCached);
      return dbCached;
    }

    const token = await getSpotifyToken();
    const params = new URLSearchParams({
      q: query,
      type: "track",
      limit: "10",
      market: "KR"
    });

    const response = await fetchSpotify(
      `https://api.spotify.com/v1/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: "no-store"
      }
    );

    if (response.status === 429) {
      const stale = getCachedSearch<MusicTrackResult[]>(cacheKey, true);
      if (stale) return stale;

      const dbStale = await getCachedMusicSearch("track", cacheKey, {
        allowStale: true
      });
      if (dbStale) {
        setCachedSearch(cacheKey, dbStale);
        return dbStale;
      }

      throw new SpotifyRateLimitError(getRetryAfterSeconds(response));
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spotify track search failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as SpotifySearchResponse;

    const tracks: MusicTrackResult[] = data.tracks.items.map((track) => ({
      provider: "spotify",
      providerTrackId: track.id,
      title: track.name,
      artistName: track.artists.map((artist) => artist.name).join(", "),
      albumName: track.album.name,
      albumArtUrl: track.album.images[0]?.url ?? "",
      externalUrl: track.external_urls.spotify,
      previewUrl: track.preview_url
    }));

    setCachedSearch(cacheKey, tracks);
    await setCachedMusicSearch("track", cacheKey, tracks);
    return tracks;
  }
}
