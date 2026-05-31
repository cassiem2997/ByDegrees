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
    imageSaves: {
      current: 0,
      cumulative: 0
    },
    shares: {
      current: 0,
      cumulative: 0
    },
    visitorCountries: [],
    visitorContinents: [],
    topArtists: [],
    topSongs: [],
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
        where ($1::timestamptz is null or created_at >= $1::timestamptz)
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
        where ($1::timestamptz is null or b.created_at >= $1::timestamptz)
          and ($2::timestamptz is null or b.created_at < $2::timestamptz)
        group by s.title
        order by count(*) desc, s.title asc
        limit 10
      `,
      [rangeStart, rangeEnd]
    )) as { title: string; count: number }[];

    const dailySeries = (await sql(
      `
        select
          to_char(day, 'YYYY-MM-DD') as date,
          count(distinct case when e.event_type = 'page_view' then e.session_id end)::int as pageviews,
          coalesce(sum(case when e.event_type = 'save_image' then 1 else 0 end), 0)::int as saves,
          coalesce(sum(case when e.event_type = 'share' then 1 else 0 end), 0)::int as shares
        from (
          select generate_series(
            coalesce(($1::timestamptz at time zone 'Asia/Seoul')::date, ((now() at time zone 'Asia/Seoul')::date - 29)),
            coalesce((($2::timestamptz at time zone 'Asia/Seoul')::date - 1), (now() at time zone 'Asia/Seoul')::date),
            interval '1 day'
          ) as day
        ) days
        left join events e on (e.created_at at time zone 'Asia/Seoul')::date = day::date
        group by day
        order by day asc
      `,
      [rangeStart, rangeEnd]
    )) as { date: string; pageviews: number; saves: number; shares: number }[];

    return {
      visitors: {
        current: visitorCounts?.current ?? 0,
        cumulative: visitorCounts?.cumulative ?? 0
      },
      imageSaves: {
        current: imageSaveCounts?.current ?? 0,
        cumulative: imageSaveCounts?.cumulative ?? 0
      },
      shares: {
        current: shareCounts?.current ?? 0,
        cumulative: shareCounts?.cumulative ?? 0
      },
      visitorCountries,
      visitorContinents: visitorContinents.map((item) => ({
        name: continentName(item.name),
        count: item.count
      })),
      topArtists,
      topSongs,
      dailySeries: dailySeries.map((entry) => ({
        date: entry.date,
        pageViews: entry.pageviews,
        saves: entry.saves,
        shares: entry.shares
      }))
    };
  } catch (error) {
    console.error("Failed to load admin analytics summary", error);
    return fallback;
  }
}
