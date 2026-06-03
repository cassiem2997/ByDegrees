import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

const cwd = process.cwd();
const artistNames = process.argv.slice(2);
const targetArtists =
  artistNames.length > 0
    ? artistNames.map((artistName) => ({
        query: artistName,
        cacheNames: [artistName]
      }))
    : [
        { query: "Red Velvet", cacheNames: ["Red Velvet", "레드벨벳"] },
        { query: "ILLIT", cacheNames: ["ILLIT", "아일릿"] },
        { query: "aespa", cacheNames: ["aespa", "에스파"] },
        { query: "NewJeans", cacheNames: ["NewJeans", "뉴진스"] },
        { query: "BLACKPINK", cacheNames: ["BLACKPINK", "블랙핑크"] },
        { query: "BTS", cacheNames: ["BTS", "방탄소년단"] },
        { query: "NCT DREAM", cacheNames: ["NCT DREAM", "엔시티 드림"] },
        { query: "SEVENTEEN", cacheNames: ["SEVENTEEN", "세븐틴"] },
        { query: "IVE", cacheNames: ["IVE", "아이브"] },
        { query: "LE SSERAFIM", cacheNames: ["LE SSERAFIM", "르세라핌"] }
      ];
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

function getArtworkUrl(artworkUrl100) {
  return artworkUrl100?.replace(/100x100bb\.(jpg|png)$/i, "600x600bb.$1") ?? "";
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const key = getKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

async function fetchITunesJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`iTunes request failed (${response.status}): ${text}`);
  }

  return response.json();
}

function toArtistResult(artist) {
  return {
    provider: "spotify",
    providerArtistId: `itunes:${artist.artistId}`,
    name: artist.artistName ?? "",
    imageUrl: "",
    externalUrl: artist.artistLinkUrl ?? "",
    followerCount: 0,
    genres: artist.primaryGenreName ? [artist.primaryGenreName] : []
  };
}

function toTrackResult(track) {
  return {
    provider: "spotify",
    providerTrackId: `itunes:${track.trackId}`,
    title: track.trackName ?? "",
    artistName: track.artistName ?? "",
    albumName: track.collectionName ?? "",
    albumArtUrl: getArtworkUrl(track.artworkUrl100),
    externalUrl: track.trackViewUrl ?? "",
    previewUrl: track.previewUrl ?? null
  };
}

async function searchArtist(artistName) {
  const params = new URLSearchParams({
    term: artistName,
    media: "music",
    entity: "musicArtist",
    country: "KR",
    limit: "10",
    lang: "ko_kr"
  });
  const data = await fetchITunesJson(
    `https://itunes.apple.com/search?${params.toString()}`
  );

  const artists = data.results
    .filter((artist) => artist.artistId && artist.artistName)
    .map(toArtistResult);
  const exact = artists.find(
    (artist) => artist.name.toLowerCase() === artistName.toLowerCase()
  );

  return {
    selectedArtist: exact ?? artists[0],
    artistResults: artists
  };
}

async function searchTracks(query) {
  const params = new URLSearchParams({
    term: query,
    media: "music",
    entity: "song",
    country: "KR",
    limit: "50",
    lang: "ko_kr"
  });
  const data = await fetchITunesJson(
    `https://itunes.apple.com/search?${params.toString()}`
  );

  return data.results
    .filter((track) => track.trackId && track.trackName && track.artistName)
    .map(toTrackResult);
}

async function lookupArtistSongs(providerArtistId) {
  const artistId = providerArtistId.replace(/^itunes:/, "");
  const params = new URLSearchParams({
    id: artistId,
    entity: "song",
    country: "KR",
    limit: "200",
    lang: "ko_kr"
  });
  const data = await fetchITunesJson(
    `https://itunes.apple.com/lookup?${params.toString()}`
  );

  return data.results
    .filter((track) => track.wrapperType === "track")
    .filter((track) => track.trackId && track.trackName && track.artistName)
    .map(toTrackResult);
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

function buildTrackCacheEntries(artistNames, tracks) {
  const entries = new Map();
  const uniqueTracks = uniqueBy(tracks, (track) => track.providerTrackId);

  for (const artistName of artistNames) {
    entries.set(`itunes:track:${normalizeCachePart(artistName)}`, uniqueTracks);
  }

  for (const track of uniqueTracks) {
    const title = normalizeCachePart(track.title);

    const keys = new Set([`itunes:track:${title}`]);
    for (const artistName of artistNames) {
      keys.add(`itunes:track:${normalizeCachePart(`${artistName} ${track.title}`)}`);
      keys.add(`itunes:track:${normalizeCachePart(`${track.title} ${artistName}`)}`);
    }

    for (const key of keys) {
      const current = entries.get(key) ?? [];
      entries.set(key, uniqueBy([...current, track], (item) => item.providerTrackId));
    }
  }

  return entries;
}

function getRelevantTracks(tracks, selectedArtist, cacheNames) {
  const matchNames = new Set(
    [selectedArtist.name, ...cacheNames].map((name) => normalizeCachePart(name))
  );
  const relevantTracks = tracks.filter((track) => {
    const artistNames = track.artistName.split(",").map((name) => normalizeCachePart(name));
    return artistNames.some((artistName) => matchNames.has(artistName));
  });

  return relevantTracks.length > 0 ? relevantTracks : tracks;
}

async function seedArtist(client, targetArtist) {
  const { query, cacheNames } = targetArtist;
  console.log(`seed artist: ${query}`);
  const { selectedArtist, artistResults } = await searchArtist(query);
  if (!selectedArtist) {
    console.log("  no artist found");
    return;
  }

  for (const cacheName of cacheNames) {
    await setCachedMusicSearch(
      client,
      "artist",
      `itunes:artist:${normalizeCachePart(cacheName)}`,
      artistResults
    );
  }

  const searchedTracks = await searchTracks(query);
  const lookupTracks = await lookupArtistSongs(selectedArtist.providerArtistId);
  const tracks = uniqueBy([...lookupTracks, ...searchedTracks], (track) => track.providerTrackId);
  const relevantTracks = getRelevantTracks(tracks, selectedArtist, cacheNames);
  const cacheEntries = buildTrackCacheEntries(cacheNames, relevantTracks);

  for (const [cacheKey, results] of cacheEntries) {
    await setCachedMusicSearch(client, "track", cacheKey, results);
  }

  console.log(`  tracks: ${relevantTracks.length}`);
  console.log(`  cache entries: ${cacheEntries.size + cacheNames.length}`);
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

  await client.connect();
  try {
    for (const targetArtist of targetArtists) {
      await seedArtist(client, targetArtist);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
