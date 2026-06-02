import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

const cwd = process.cwd();
const artistNames = process.argv.slice(2);
const targetArtists = artistNames.length > 0 ? artistNames : ["Red Velvet", "NCT DREAM"];
const cacheFreshDays = 30;
const cacheStaleDays = 180;

async function loadEnvFile(filename) {
  try {
    const content = await fs.readFile(path.join(cwd, filename), "utf8");

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] ??= value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function normalizeCachePart(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

async function getSpotifyToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are required");
  }

  const credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get Spotify token (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchSpotifyJson(url, token) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    throw new Error(
      `Spotify rate limit exceeded while seeding cache. Retry-After: ${retryAfter ?? "unknown"}`
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify request failed (${response.status}): ${text}`);
  }

  return response.json();
}

async function searchArtist(artistName, token) {
  const params = new URLSearchParams({
    q: artistName,
    type: "artist",
    limit: "10",
    market: "KR"
  });
  const data = await fetchSpotifyJson(
    `https://api.spotify.com/v1/search?${params.toString()}`,
    token
  );

  const artists = data.artists.items.map((artist) => ({
    provider: "spotify",
    providerArtistId: artist.id,
    name: artist.name,
    imageUrl: artist.images?.[0]?.url ?? "",
    externalUrl: artist.external_urls?.spotify ?? "",
    followerCount: artist.followers?.total ?? 0,
    genres: artist.genres ?? []
  }));

  const exact = artists.find(
    (artist) => artist.name.toLowerCase() === artistName.toLowerCase()
  );

  return {
    selectedArtist: exact ?? artists[0],
    artistResults: artists
  };
}

async function fetchArtistAlbums(artistId, token) {
  const albums = [];
  let nextUrl =
    `https://api.spotify.com/v1/artists/${artistId}/albums?` +
    new URLSearchParams({
      include_groups: "album,single,appears_on,compilation",
      market: "KR",
      limit: "50"
    }).toString();

  while (nextUrl) {
    const data = await fetchSpotifyJson(nextUrl, token);
    albums.push(...data.items);
    nextUrl = data.next;
  }

  return uniqueBy(albums, (album) => album.id);
}

async function fetchAlbumTracks(album, token) {
  const tracks = [];
  let nextUrl =
    `https://api.spotify.com/v1/albums/${album.id}/tracks?` +
    new URLSearchParams({
      market: "KR",
      limit: "50"
    }).toString();

  while (nextUrl) {
    const data = await fetchSpotifyJson(nextUrl, token);
    tracks.push(
      ...data.items.map((track) => ({
        provider: "spotify",
        providerTrackId: track.id,
        title: track.name,
        artistName: track.artists.map((artist) => artist.name).join(", "),
        albumName: album.name,
        albumArtUrl: album.images?.[0]?.url ?? "",
        externalUrl: track.external_urls?.spotify ?? "",
        previewUrl: track.preview_url ?? null
      }))
    );
    nextUrl = data.next;
  }

  return tracks;
}

async function setCachedMusicSearch(client, kind, cacheKey, results) {
  const expiresAt = new Date(Date.now() + cacheFreshDays * 24 * 60 * 60 * 1000);
  const staleUntil = new Date(Date.now() + cacheStaleDays * 24 * 60 * 60 * 1000);

  await client.query(
    [
      "insert into music_search_cache",
      "(provider, search_kind, cache_key, results, expires_at, stale_until)",
      "values ('spotify', $1, $2, $3::jsonb, $4, $5)",
      "on conflict (provider, search_kind, cache_key) do update set",
      "results = excluded.results,",
      "expires_at = excluded.expires_at,",
      "stale_until = excluded.stale_until,",
      "updated_at = now()"
    ].join(" "),
    [kind, cacheKey, JSON.stringify(results), expiresAt, staleUntil]
  );
}

function buildTrackCacheEntries(artistName, tracks) {
  const entries = new Map();
  const uniqueTracks = uniqueBy(tracks, (track) => track.providerTrackId);

  entries.set(`track:${normalizeCachePart(artistName)}`, uniqueTracks);

  for (const track of uniqueTracks) {
    const title = normalizeCachePart(track.title);
    const artistTitle = normalizeCachePart(`${artistName} ${track.title}`);
    const titleArtist = normalizeCachePart(`${track.title} ${artistName}`);

    for (const key of [`track:${title}`, `track:${artistTitle}`, `track:${titleArtist}`]) {
      const current = entries.get(key) ?? [];
      entries.set(key, uniqueBy([...current, track], (item) => item.providerTrackId));
    }
  }

  return entries;
}

async function seedArtist(client, token, artistName) {
  console.log(`seed artist: ${artistName}`);
  const { selectedArtist, artistResults } = await searchArtist(artistName, token);
  if (!selectedArtist) {
    console.log(`  no artist found`);
    return;
  }

  await setCachedMusicSearch(
    client,
    "artist",
    `artist:${normalizeCachePart(artistName)}`,
    artistResults
  );

  const albums = await fetchArtistAlbums(selectedArtist.providerArtistId, token);
  console.log(`  albums: ${albums.length}`);

  const trackGroups = await Promise.all(
    albums.map((album) => fetchAlbumTracks(album, token))
  );
  const tracks = uniqueBy(trackGroups.flat(), (track) => track.providerTrackId);
  const ownTracks = tracks.filter((track) =>
    track.artistName
      .split(",")
      .map((name) => normalizeCachePart(name))
      .includes(normalizeCachePart(selectedArtist.name))
  );
  const cacheEntries = buildTrackCacheEntries(selectedArtist.name, ownTracks);

  for (const [cacheKey, results] of cacheEntries) {
    await setCachedMusicSearch(client, "track", cacheKey, results);
  }

  console.log(`  tracks: ${ownTracks.length}`);
  console.log(`  cache entries: ${cacheEntries.size + 1}`);
}

async function main() {
  await loadEnvFile(".env.local");
  await loadEnvFile(".env");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl:
      databaseUrl.includes("supabase.co") || databaseUrl.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined
  });
  const token = await getSpotifyToken();

  await client.connect();
  try {
    await client.query("delete from service_rate_limits where service = 'spotify-search'");

    for (const artistName of targetArtists) {
      await seedArtist(client, token, artistName);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
