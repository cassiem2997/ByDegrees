import { getSql } from "@/lib/db";
import { AdminSummary, EventType } from "@/lib/types";

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
  } catch {
    return null;
  }
}

export async function getAdminSummary(days = 7): Promise<AdminSummary> {
  const fallback: AdminSummary = {
    visitors: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      cumulative: 0
    },
    imageSaves: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      cumulative: 0
    },
    shares: {
      daily: 0,
      weekly: 0,
      monthly: 0,
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
    const [visitorCounts] = (await sql(
      `
        select
          count(distinct case when created_at >= current_date then session_id end)::int as daily,
          count(distinct case when created_at >= date_trunc('week', now()) then session_id end)::int as weekly,
          count(distinct case when created_at >= date_trunc('month', now()) then session_id end)::int as monthly,
          count(distinct session_id)::int as cumulative
        from events
        where event_type = 'page_view'
      `
    )) as { daily: number; weekly: number; monthly: number; cumulative: number }[];

    const [imageSaveCounts] = (await sql(
      `
        select
          count(case when created_at >= current_date then 1 end)::int as daily,
          count(case when created_at >= date_trunc('week', now()) then 1 end)::int as weekly,
          count(case when created_at >= date_trunc('month', now()) then 1 end)::int as monthly,
          count(*)::int as cumulative
        from events
        where event_type = 'save_image'
      `
    )) as { daily: number; weekly: number; monthly: number; cumulative: number }[];

    const [shareCounts] = (await sql(
      `
        select
          count(case when created_at >= current_date then 1 end)::int as daily,
          count(case when created_at >= date_trunc('week', now()) then 1 end)::int as weekly,
          count(case when created_at >= date_trunc('month', now()) then 1 end)::int as monthly,
          count(*)::int as cumulative
        from events
        where event_type = 'share'
      `
    )) as { daily: number; weekly: number; monthly: number; cumulative: number }[];

    const visitorCountries = (await sql(
      `
        select metadata->>'country' as name, count(distinct session_id)::int as count
        from events
        where event_type = 'page_view'
          and metadata ? 'country'
          and coalesce(metadata->>'country', '') <> ''
        group by metadata->>'country'
        order by count(distinct session_id) desc
        limit 15
      `
    )) as { name: string; count: number }[];

    const visitorContinents = (await sql(
      `
        select metadata->>'continent' as name, count(distinct session_id)::int as count
        from events
        where event_type = 'page_view'
          and metadata ? 'continent'
          and coalesce(metadata->>'continent', '') <> ''
        group by metadata->>'continent'
        order by count(distinct session_id) desc
      `
    )) as { name: string; count: number }[];

    const topArtists = (await sql(
      "select metadata->>'artist' as name, count(*)::int as count from events where metadata ? 'artist' group by metadata->>'artist' order by count(*) desc limit 5"
    )) as { name: string; count: number }[];

    const topSongs = (await sql(
      "select metadata->>'song_title' as title, count(*)::int as count from events where event_type = 'select_song' and metadata ? 'song_title' group by metadata->>'song_title' order by count(*) desc limit 10"
    )) as { title: string; count: number }[];

    const dailySeries = (await sql(
      "select to_char(day, 'YYYY-MM-DD') as date, coalesce(sum(case when event_type = 'page_view' then 1 else 0 end), 0)::int as pageviews, coalesce(sum(case when event_type = 'save_image' then 1 else 0 end), 0)::int as saves, coalesce(sum(case when event_type = 'share' then 1 else 0 end), 0)::int as shares from (select generate_series(current_date - ($1::int - 1), current_date, interval '1 day') as day) days left join events e on e.created_at::date = day::date group by day order by day asc",
      [Math.max(days, 14)]
    )) as { date: string; pageviews: number; saves: number; shares: number }[];

    return {
      visitors: {
        daily: visitorCounts?.daily ?? 0,
        weekly: visitorCounts?.weekly ?? 0,
        monthly: visitorCounts?.monthly ?? 0,
        cumulative: visitorCounts?.cumulative ?? 0
      },
      imageSaves: {
        daily: imageSaveCounts?.daily ?? 0,
        weekly: imageSaveCounts?.weekly ?? 0,
        monthly: imageSaveCounts?.monthly ?? 0,
        cumulative: imageSaveCounts?.cumulative ?? 0
      },
      shares: {
        daily: shareCounts?.daily ?? 0,
        weekly: shareCounts?.weekly ?? 0,
        monthly: shareCounts?.monthly ?? 0,
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
  } catch {
    return fallback;
  }
}
