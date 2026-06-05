import { getCachedMusicSearch, setCachedMusicSearch } from "@/lib/db/music-search-cache";
import { MusicArtistResult, MusicTrackResult } from "@/lib/types";
import { MusicProvider } from "@/lib/providers/music/types";

type ITunesSearchResponse<T> = {
  resultCount: number;
  results: T[];
};

type ITunesTrackResult = {
  wrapperType?: string;
  kind?: string;
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
  previewUrl?: string;
};

type ITunesArtistResult = {
  wrapperType?: string;
  artistType?: string;
  artistId?: number;
  artistName?: string;
  artistLinkUrl?: string;
  primaryGenreName?: string;
  primaryGenreId?: number;
};

const SEARCH_CACHE_TTL_MS = 60 * 60 * 1000;
const SEARCH_CACHE_STALE_TTL_MS = 6 * 60 * 60 * 1000;

type SearchCacheEntry<T> = {
  value: T;
  expiresAt: number;
  staleUntil: number;
};

const searchCache = new Map<string, SearchCacheEntry<unknown>>();

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

async function getStaleCachedMusicSearch<T extends "artist" | "track">(
  kind: T,
  cacheKey: string
) {
  const stale = getCachedSearch<T extends "artist" ? MusicArtistResult[] : MusicTrackResult[]>(
    cacheKey,
    true
  );
  if (stale) return stale;

  const dbStale = await getCachedMusicSearch(kind, cacheKey, {
    allowStale: true,
    provider: "itunes"
  });
  if (dbStale) {
    setCachedSearch(cacheKey, dbStale);
    return dbStale;
  }

  return null;
}

function getArtworkUrl(artworkUrl100?: string) {
  return artworkUrl100?.replace(/100x100bb\.(jpg|png)$/i, "600x600bb.$1") ?? "";
}

async function fetchITunesSearch<T>(params: URLSearchParams): Promise<T[]> {
  const response = await fetch(
    `https://itunes.apple.com/search?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 404 && errorText.includes("newNullResponse")) {
      return [];
    }

    throw new Error(`iTunes search failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as ITunesSearchResponse<T>;
  return data.results;
}

export class ITunesMusicProvider implements MusicProvider {
  async searchArtists(query: string): Promise<MusicArtistResult[]> {
    const cacheKey = `itunes:artist:${normalizeCachePart(query)}`;
    const cached = getCachedSearch<MusicArtistResult[]>(cacheKey);
    if (cached) return cached;

    const dbCached = await getCachedMusicSearch("artist", cacheKey, { provider: "itunes" });
    if (dbCached) {
      setCachedSearch(cacheKey, dbCached);
      return dbCached;
    }

    const params = new URLSearchParams({
      term: query,
      media: "music",
      entity: "musicArtist",
      country: "KR",
      limit: "10",
      lang: "ko_kr"
    });

    try {
      const results = await fetchITunesSearch<ITunesArtistResult>(params);
      const artists = results
        .filter((artist) => artist.artistId && artist.artistName)
        .map((artist) => ({
          provider: "itunes" as const,
          providerArtistId: `itunes:${artist.artistId}`,
          name: artist.artistName ?? "",
          imageUrl: "",
          externalUrl: artist.artistLinkUrl ?? "",
          followerCount: 0,
          genres: artist.primaryGenreName ? [artist.primaryGenreName] : []
        }));

      setCachedSearch(cacheKey, artists);
      await setCachedMusicSearch("artist", cacheKey, artists, "itunes");
      return artists;
    } catch (error) {
      const stale = await getStaleCachedMusicSearch("artist", cacheKey);
      if (stale) return stale;

      throw error;
    }
  }

  async searchTracks(query: string): Promise<MusicTrackResult[]> {
    const cacheKey = `itunes:track:${normalizeCachePart(query)}`;
    const cached = getCachedSearch<MusicTrackResult[]>(cacheKey);
    if (cached) return cached;

    const dbCached = await getCachedMusicSearch("track", cacheKey, { provider: "itunes" });
    if (dbCached) {
      setCachedSearch(cacheKey, dbCached);
      return dbCached;
    }

    const params = new URLSearchParams({
      term: query,
      media: "music",
      entity: "song",
      country: "KR",
      limit: "10",
      lang: "ko_kr"
    });

    try {
      const results = await fetchITunesSearch<ITunesTrackResult>(params);
      const tracks = results
        .filter((track) => track.trackId && track.trackName && track.artistName)
        .map((track) => ({
          provider: "itunes" as const,
          providerTrackId: `itunes:${track.trackId}`,
          title: track.trackName ?? "",
          artistName: track.artistName ?? "",
          albumName: track.collectionName ?? "",
          albumArtUrl: getArtworkUrl(track.artworkUrl100),
          externalUrl: track.trackViewUrl ?? "",
          previewUrl: track.previewUrl ?? null
        }));

      setCachedSearch(cacheKey, tracks);
      await setCachedMusicSearch("track", cacheKey, tracks, "itunes");
      return tracks;
    } catch (error) {
      const stale = await getStaleCachedMusicSearch("track", cacheKey);
      if (stale) return stale;

      throw error;
    }
  }
}
