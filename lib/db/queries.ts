import { getSql } from "@/lib/db";
import { DEFAULT_TEMPERATURE_PRESETS, TEMP_TEMPLATE_KEY } from "@/lib/constants/temperature-presets";
import { BoardPayload, BoardSummary, BoardSongSlot, MusicTrackResult, TemperaturePreset } from "@/lib/types";
import { buildBoardSlug, slugify } from "@/lib/slug";

type TemperaturePresetRow = {
  id: string;
  template_key: string;
  label: string;
  min_temp: number | null;
  max_temp: number | null;
  sort_order: number;
};

type BoardDetailRow = {
  board_id: string;
  board_slug: string;
  board_title: string;
  board_artist_name: string;
  board_is_public: boolean;
  board_template_key: string;
  board_created_at: string;
  preset_id: string;
  preset_template_key: string;
  preset_label: string;
  preset_min_temp: number | null;
  preset_max_temp: number | null;
  preset_sort_order: number;
  slot_index: number | null;
  song_provider_track_id: string | null;
  song_title: string | null;
  song_artist_name: string | null;
  song_album_name: string | null;
  song_album_art_url: string | null;
  song_external_url: string | null;
  song_preview_url: string | null;
};

function mapPreset(row: TemperaturePresetRow): TemperaturePreset {
  return {
    id: row.id,
    templateKey: row.template_key,
    label: row.label,
    minTemp: row.min_temp,
    maxTemp: row.max_temp,
    sortOrder: row.sort_order
  };
}

export async function getTemperaturePresets(templateKey = TEMP_TEMPLATE_KEY) {
  try {
    const sql = getSql();
    const rows = (await sql(
      "select id, template_key, label, min_temp, max_temp, sort_order from temperature_presets where template_key = $1 order by sort_order asc",
      [templateKey]
    )) as TemperaturePresetRow[];

    if (rows.length > 0) {
      return rows.map(mapPreset);
    }
  } catch {
    return DEFAULT_TEMPERATURE_PRESETS;
  }

  return DEFAULT_TEMPERATURE_PRESETS;
}

export async function upsertArtist(name: string) {
  const sql = getSql();
  const slug = slugify(name);
  const rows = (await sql(
    "insert into artists (name, slug) values ($1, $2) on conflict (name) do update set slug = excluded.slug returning id",
    [name, slug]
  )) as { id: string }[];

  return rows[0]?.id ?? null;
}

export async function upsertSong(song: MusicTrackResult) {
  const sql = getSql();
  const rows = (await sql(
    "insert into songs (provider, provider_track_id, title, artist_name, album_name, album_art_url, external_url, preview_url) values ($1, $2, $3, $4, $5, $6, $7, $8) on conflict (provider_track_id) do update set title = excluded.title, artist_name = excluded.artist_name, album_name = excluded.album_name, album_art_url = excluded.album_art_url, external_url = excluded.external_url, preview_url = excluded.preview_url returning id",
    [
      song.provider,
      song.providerTrackId,
      song.title,
      song.artistName,
      song.albumName,
      song.albumArtUrl,
      song.externalUrl,
      song.previewUrl
    ]
  )) as { id: string }[];

  return rows[0].id;
}

export async function createBoard(
  payload: BoardPayload,
  options: { isInternal?: boolean } = {}
) {
  const sql = getSql();
  const slug = buildBoardSlug(payload.artistName, payload.title);
  const artistId = await upsertArtist(payload.artistName);

  const boardRows = (await sql(
    "insert into boards (title, slug, artist_name, artist_id, template_key, is_public, aspect_ratio, is_internal) values ($1, $2, $3, $4, $5, $6, $7, $8) returning id, slug",
    [
      payload.title,
      slug,
      payload.artistName,
      artistId,
      payload.templateKey,
      payload.isPublic,
      "portrait",
      options.isInternal ?? false
    ]
  )) as { id: string; slug: string }[];

  const boardId = boardRows[0].id;

  for (const row of payload.rows) {
    for (const [slotIndex, song] of row.songs.entries()) {
      if (!song) continue;
      const songId = await upsertSong(song);
      await sql(
        "insert into board_items (board_id, temperature_preset_id, song_id, slot_index, sort_order) values ($1, $2, $3, $4, $5)",
        [boardId, row.temperaturePresetId, songId, slotIndex, slotIndex + 1]
      );
    }
  }

  return {
    id: boardId,
    slug: boardRows[0].slug
  };
}

export async function getBoardBySlug(slug: string): Promise<BoardSummary | null> {
  try {
    const sql = getSql();
    const rows = (await sql(
      "select b.id as board_id, b.slug as board_slug, b.title as board_title, b.artist_name as board_artist_name, b.is_public as board_is_public, b.template_key as board_template_key, b.created_at as board_created_at, tp.id as preset_id, tp.template_key as preset_template_key, tp.label as preset_label, tp.min_temp as preset_min_temp, tp.max_temp as preset_max_temp, tp.sort_order as preset_sort_order, bi.slot_index as slot_index, s.provider_track_id as song_provider_track_id, s.title as song_title, s.artist_name as song_artist_name, s.album_name as song_album_name, s.album_art_url as song_album_art_url, s.external_url as song_external_url, s.preview_url as song_preview_url from boards b join temperature_presets tp on tp.template_key = b.template_key left join board_items bi on bi.board_id = b.id and bi.temperature_preset_id = tp.id left join songs s on s.id = bi.song_id where b.slug = $1 order by tp.sort_order asc, bi.slot_index asc nulls last",
      [slug]
    )) as BoardDetailRow[];

    if (rows.length === 0) return null;

    const first = rows[0];
    const presetMap = new Map<string, { preset: TemperaturePreset; songs: BoardSongSlot[] }>();

    for (const row of rows) {
      if (!presetMap.has(row.preset_id)) {
        presetMap.set(row.preset_id, {
          preset: {
            id: row.preset_id,
            templateKey: row.preset_template_key,
            label: row.preset_label,
            minTemp: row.preset_min_temp,
            maxTemp: row.preset_max_temp,
            sortOrder: row.preset_sort_order
          },
          songs: [null, null, null]
        });
      }

      if (row.slot_index !== null && row.song_provider_track_id) {
        presetMap.get(row.preset_id)!.songs[row.slot_index] = {
          provider: "spotify",
          providerTrackId: row.song_provider_track_id,
          title: row.song_title ?? "",
          artistName: row.song_artist_name ?? "",
          albumName: row.song_album_name ?? "",
          albumArtUrl: row.song_album_art_url ?? "",
          externalUrl: row.song_external_url ?? "",
          previewUrl: row.song_preview_url
        };
      }
    }

    return {
      id: first.board_id,
      slug: first.board_slug,
      title: first.board_title,
      artistName: first.board_artist_name,
      isPublic: first.board_is_public,
      templateKey: first.board_template_key,
      createdAt: first.board_created_at,
      rows: Array.from(presetMap.values()).map((entry) => ({
        preset: entry.preset,
        songs: entry.songs
      }))
    };
  } catch {
    return null;
  }
}

export async function getFeaturedBoards() {
  const sampleRows = DEFAULT_TEMPERATURE_PRESETS.map((preset, index) => ({
    preset,
    songs: [
      {
        provider: "spotify" as const,
        providerTrackId: `sample-${index}-1`,
        title: ["Red Flavor", "Hello Future", "Love Dive", "Butterfly"][index % 4],
        artistName: ["Red Velvet", "NCT DREAM", "IVE", "LOONA"][index % 4],
        albumName: "Fan Selected",
        albumArtUrl: "",
        externalUrl: "https://open.spotify.com/",
        previewUrl: null
      },
      null,
      null
    ]
  }));

  return [
    {
      id: "sample-1",
      slug: "sample-red-velvet",
      title: "기온별 레드벨벳 노래",
      artistName: "Red Velvet",
      isPublic: true,
      templateKey: TEMP_TEMPLATE_KEY,
      createdAt: new Date().toISOString(),
      rows: sampleRows
    }
  ];
}
