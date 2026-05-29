import { assertServerEnv } from "@/lib/config";
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spotify artist search failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as SpotifyArtistSearchResponse;

    return data.artists.items.map((artist) => ({
      provider: "spotify",
      providerArtistId: artist.id,
      name: artist.name,
      imageUrl: artist.images?.[0]?.url ?? "",
      externalUrl: artist.external_urls?.spotify ?? "",
      followerCount: artist.followers?.total ?? 0,
      genres: artist.genres ?? []
    }));
  }

  async searchTracks(query: string): Promise<MusicTrackResult[]> {
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spotify track search failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as SpotifySearchResponse;

    return data.tracks.items.map((track) => ({
      provider: "spotify",
      providerTrackId: track.id,
      title: track.name,
      artistName: track.artists.map((artist) => artist.name).join(", "),
      albumName: track.album.name,
      albumArtUrl: track.album.images[0]?.url ?? "",
      externalUrl: track.external_urls.spotify,
      previewUrl: track.preview_url
    }));
  }
}
