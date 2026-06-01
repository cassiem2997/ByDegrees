import { getSql } from "@/lib/db";
import { AdminSummary, EventType } from "@/lib/types";
import { AdminPeriod, normalizeAdminPeriod, toSeoulTimestamp } from "@/lib/admin-period";

function continentName(code: string) {
  const names: Record<string, string> = {
    AF: "Africa",
    AN: "Antarctica",
    AS: "Asia",
    EU: "Europe",
    NA: "North America",
    OC: "Oceania",
    SA: "South America"
  };

  return names[code] ?? code;
}

function rate(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
}

export async function logEvent(
  eventType: EventType,
  sessionId: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    const sql = getSql();
    await sql(
      "insert into events (event_type, session_id, metadata) values ($1, $2, $3::jsonb)",
      [eventType, sessionId, JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error("Failed to log analytics event", {
      eventType,
      error
    });
    return null;
  }
}

export async function getAdminSummary(
  period: AdminPeriod = normalizeAdminPeriod()
): Promise<AdminSummary> {
  const fallback: AdminSummary = {
    visitors: {
      current: 0,
      cumulative: 0
    },
    boardsCreated: {
      current: 0,
      cumulative: 0
    },
    imageSaves: {
      current: 0,
      cumulative: 0
    },
    shares: {
      current: 0,
      cumulative: 0
    },
    funnel: {
      visitToCreateRate: 0,
      createToSaveRate: 0,
      createToShareRate: 0,
      averageSongsPerBoard: 0
    },
    temperatureInsights: {
      emptiest: null,
      fullest: null
    },
    visitorCountries: [],
    visitorContinents: [],
    topArtists: [],
    topSongs: [],
    exploredArtists: [],
    exploredSongs: [],
    dailySeries: []
  };

  try {
    const sql = getSql();
    const rangeStart = period.startKey ? toSeoulTimestamp(period.startKey) : null;
    const rangeEnd = period.endKey ? toSeoulTimestamp(period.endKey) : null;

    const [visitorCounts] = (await sql(
      `
        select
          count(distinct case
            when ($1::timestamptz is null or created_at >= $1::timestamptz)
              and ($2::timestamptz is null or created_at < $2::timestamptz)
            then session_id
          end)::int as current,
          count(distinct session_id)::int as cumulative
        from events
        where event_type = 'page_view'
      `,
      [rangeStart, rangeEnd]
    )) as { current: number; cumulative: number }[];

    const [boardCounts] = (await sql(
      `
        select
          count(case
            when ($1::timestamptz is null or created_at >= $1::timestamptz)
              and ($2::timestamptz is null or created_at < $2::timestamptz)
            then 1
          end)::int as current,
          count(*)::int as cumulative
        from boards
        where coalesce(is_internal, false) = false
      `,
      [rangeStart, rangeEnd]
    )) as { current: number; cumulative: number }[];

    const [imageSaveCounts] = (await sql(
      `
        select
          count(case
            when ($1::timestamptz is null or created_at >= $1::timestamptz)
              and ($2::timestamptz is null or created_at < $2::timestamptz)
            then 1
          end)::int as current,
          count(*)::int as cumulative
        from events
        where event_type = 'save_image'
      `,
      [rangeStart, rangeEnd]
    )) as { current: number; cumulative: number }[];

    const [shareCounts] = (await sql(
      `
        select
          count(case
            when ($1::timestamptz is null or created_at >= $1::timestamptz)
              and ($2::timestamptz is null or created_at < $2::timestamptz)
            then 1
          end)::int as current,
          count(*)::int as cumulative
        from events
        where event_type = 'share'
      `,
      [rangeStart, rangeEnd]
    )) as { current: number; cumulative: number }[];

    const visitorCountries = (await sql(
      `
        select metadata->>'country' as name, count(distinct session_id)::int as count
        from events
        where event_type = 'page_view'
          and metadata ? 'country'
          and coalesce(metadata->>'country', '') <> ''
          and ($1::timestamptz is null or created_at >= $1::timestamptz)
          and ($2::timestamptz is null or created_at < $2::timestamptz)
        group by metadata->>'country'
        order by count(distinct session_id) desc
        limit 15
      `,
      [rangeStart, rangeEnd]
    )) as { name: string; count: number }[];

    const visitorContinents = (await sql(
      `
        select metadata->>'continent' as name, count(distinct session_id)::int as count
        from events
        where event_type = 'page_view'
          and metadata ? 'continent'
          and coalesce(metadata->>'continent', '') <> ''
          and ($1::timestamptz is null or created_at >= $1::timestamptz)
          and ($2::timestamptz is null or created_at < $2::timestamptz)
        group by metadata->>'continent'
        order by count(distinct session_id) desc
      `,
      [rangeStart, rangeEnd]
    )) as { name: string; count: number }[];

    const topArtists = (await sql(
      `
        select artist_name as name, count(*)::int as count
        from boards
        where coalesce(is_internal, false) = false
          and ($1::timestamptz is null or created_at >= $1::timestamptz)
          and ($2::timestamptz is null or created_at < $2::timestamptz)
        group by artist_name
        order by count(*) desc, artist_name asc
        limit 5
      `,
      [rangeStart, rangeEnd]
    )) as { name: string; count: number }[];

    const topSongs = (await sql(
      `
        select s.title as title, count(*)::int as count
        from board_items bi
        join boards b on b.id = bi.board_id
        join songs s on s.id = bi.song_id
        where coalesce(b.is_internal, false) = false
          and ($1::timestamptz is null or b.created_at >= $1::timestamptz)
          and ($2::timestamptz is null or b.created_at < $2::timestamptz)
        group by s.title
        order by count(*) desc, s.title asc
        limit 10
      `,
      [rangeStart, rangeEnd]
    )) as { title: string; count: number }[];

    const exploredArtists = (await sql(
      `
        select metadata->>'artist' as name, count(*)::int as count
        from events
        where event_type = 'select_artist'
          and metadata ? 'artist'
          and coalesce(metadata->>'artist', '') <> ''
          and ($1::timestamptz is null or created_at >= $1::timestamptz)
          and ($2::timestamptz is null or created_at < $2::timestamptz)
        group by metadata->>'artist'
        order by count(*) desc, metadata->>'artist' asc
        limit 5
      `,
      [rangeStart, rangeEnd]
    )) as { name: string; count: number }[];

    const exploredSongs = (await sql(
      `
        select metadata->>'song_title' as title, count(*)::int as count
        from events
        where event_type = 'select_song'
          and metadata ? 'song_title'
          and coalesce(metadata->>'song_title', '') <> ''
          and ($1::timestamptz is null or created_at >= $1::timestamptz)
          and ($2::timestamptz is null or created_at < $2::timestamptz)
        group by metadata->>'song_title'
        order by count(*) desc, metadata->>'song_title' asc
        limit 10
      `,
      [rangeStart, rangeEnd]
    )) as { title: string; count: number }[];

    const [averageSongs] = (await sql(
      `
        select coalesce(round(count(bi.id)::numeric / nullif(count(distinct b.id), 0), 1), 0)::float as average
        from boards b
        left join board_items bi on bi.board_id = b.id
        where coalesce(b.is_internal, false) = false
          and ($1::timestamptz is null or b.created_at >= $1::timestamptz)
          and ($2::timestamptz is null or b.created_at < $2::timestamptz)
      `,
      [rangeStart, rangeEnd]
    )) as { average: number }[];

    const temperatureRows = (await sql(
      `
        with filtered_boards as (
          select id
          from boards
          where coalesce(is_internal, false) = false
            and ($1::timestamptz is null or created_at >= $1::timestamptz)
            and ($2::timestamptz is null or created_at < $2::timestamptz)
        ),
        board_total as (
          select count(*)::int as total from filtered_boards
        ),
        preset_counts as (
          select
            tp.label,
            tp.sort_order,
            count(bi.id)::int as placements,
            count(distinct bi.board_id)::int as filled_boards
          from temperature_presets tp
          cross join board_total bt
          left join board_items bi
            on bi.temperature_preset_id = tp.id
            and bi.board_id in (select id from filtered_boards)
          where tp.template_key = 'temp-core-v1'
          group by tp.label, tp.sort_order
        )
        select
          label,
          placements,
          filled_boards,
          (select total from board_total) as total_boards,
          ((select total from board_total) - filled_boards)::int as empty_boards
        from preset_counts
        order by sort_order asc
      `,
      [rangeStart, rangeEnd]
    )) as {
      label: string;
      placements: number;
      filled_boards: number;
      total_boards: number;
      empty_boards: number;
    }[];

    const dailySeries = (await sql(
      `
        with days as (
          select generate_series(
            coalesce(($1::timestamptz at time zone 'Asia/Seoul')::date, ((now() at time zone 'Asia/Seoul')::date - 29)),
            coalesce((($2::timestamptz at time zone 'Asia/Seoul')::date - 1), (now() at time zone 'Asia/Seoul')::date),
            interval '1 day'
          ) as day
        ),
        event_counts as (
          select
            (created_at at time zone 'Asia/Seoul')::date as day,
            count(distinct case when event_type = 'page_view' then session_id end)::int as pageviews,
            coalesce(sum(case when event_type = 'save_image' then 1 else 0 end), 0)::int as saves,
            coalesce(sum(case when event_type = 'share' then 1 else 0 end), 0)::int as shares
          from events
          group by (created_at at time zone 'Asia/Seoul')::date
        ),
        board_counts as (
          select
            (created_at at time zone 'Asia/Seoul')::date as day,
            count(*)::int as creates
          from boards
          where coalesce(is_internal, false) = false
          group by (created_at at time zone 'Asia/Seoul')::date
        )
        select
          to_char(days.day, 'YYYY-MM-DD') as date,
          coalesce(event_counts.pageviews, 0)::int as pageviews,
          coalesce(board_counts.creates, 0)::int as creates,
          coalesce(event_counts.saves, 0)::int as saves,
          coalesce(event_counts.shares, 0)::int as shares
        from days
        left join event_counts on event_counts.day = days.day::date
        left join board_counts on board_counts.day = days.day::date
        order by days.day asc
      `,
      [rangeStart, rangeEnd]
    )) as { date: string; pageviews: number; creates: number; saves: number; shares: number }[];

    const currentVisitors = visitorCounts?.current ?? 0;
    const currentBoards = boardCounts?.current ?? 0;
    const currentSaves = imageSaveCounts?.current ?? 0;
    const currentShares = shareCounts?.current ?? 0;
    const rowsWithBoards = temperatureRows.filter((row) => row.total_boards > 0);
    const emptiest = rowsWithBoards
      .filter((row) => row.empty_boards > 0)
      .sort((a, b) => b.empty_boards - a.empty_boards || a.filled_boards - b.filled_boards)[0];
    const fullest = rowsWithBoards
      .filter((row) => row.placements > 0)
      .sort((a, b) => b.placements - a.placements || a.empty_boards - b.empty_boards)[0];

    return {
      visitors: {
        current: currentVisitors,
        cumulative: visitorCounts?.cumulative ?? 0
      },
      boardsCreated: {
        current: currentBoards,
        cumulative: boardCounts?.cumulative ?? 0
      },
      imageSaves: {
        current: currentSaves,
        cumulative: imageSaveCounts?.cumulative ?? 0
      },
      shares: {
        current: currentShares,
        cumulative: shareCounts?.cumulative ?? 0
      },
      funnel: {
        visitToCreateRate: rate(currentBoards, currentVisitors),
        createToSaveRate: rate(currentSaves, currentBoards),
        createToShareRate: rate(currentShares, currentBoards),
        averageSongsPerBoard: averageSongs?.average ?? 0
      },
      temperatureInsights: {
        emptiest: emptiest
          ? {
              label: emptiest.label,
              count: emptiest.empty_boards,
              totalBoards: emptiest.total_boards
            }
          : null,
        fullest: fullest
          ? {
              label: fullest.label,
              count: fullest.placements,
              totalBoards: fullest.total_boards
            }
          : null
      },
      visitorCountries,
      visitorContinents: visitorContinents.map((item) => ({
        name: continentName(item.name),
        count: item.count
      })),
      topArtists,
      topSongs,
      exploredArtists,
      exploredSongs,
      dailySeries: dailySeries.map((entry) => ({
        date: entry.date,
        pageViews: entry.pageviews,
        creates: entry.creates,
        saves: entry.saves,
        shares: entry.shares
      }))
    };
  } catch (error) {
    console.error("Failed to load admin analytics summary", error);
    return fallback;
  }
}
