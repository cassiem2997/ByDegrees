import { getSql } from "@/lib/db";

type SearchErrorIncidentRow = {
  error_count: number;
  notice_triggered_at: string | null;
};

function normalizeQuery(query: string) {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeErrorMessage(errorMessage: string) {
  return errorMessage.trim().replace(/\s+/g, " ").slice(0, 300);
}

function buildFingerprint(route: string, query: string, errorMessage: string) {
  return [route, normalizeQuery(query), normalizeErrorMessage(errorMessage)].join("|");
}

export async function recordSearchErrorIncident({
  route,
  query,
  errorMessage,
  threshold,
  windowSeconds
}: {
  route: string;
  query: string;
  errorMessage: string;
  threshold: number;
  windowSeconds: number;
}) {
  const sql = getSql();
  const normalizedQuery = normalizeQuery(query);
  const normalizedErrorMessage = normalizeErrorMessage(errorMessage);
  const fingerprint = buildFingerprint(route, query, errorMessage);

  const rows = (await sql(
    [
      "insert into search_error_incidents",
      "(fingerprint, route, query, error_message, error_count, first_seen_at, last_seen_at, notice_triggered_at)",
      "values ($1, $2, $3, $4, 1, now(), now(), null)",
      "on conflict (fingerprint) do update set",
      "error_count = case",
      "when search_error_incidents.last_seen_at < now() - ($5::int * interval '1 second') then 1",
      "else search_error_incidents.error_count + 1",
      "end,",
      "first_seen_at = case",
      "when search_error_incidents.last_seen_at < now() - ($5::int * interval '1 second') then now()",
      "else search_error_incidents.first_seen_at",
      "end,",
      "last_seen_at = now(),",
      "route = excluded.route,",
      "query = excluded.query,",
      "error_message = excluded.error_message,",
      "notice_triggered_at = case",
      "when search_error_incidents.last_seen_at < now() - ($5::int * interval '1 second') then null",
      "else search_error_incidents.notice_triggered_at",
      "end",
      "returning error_count, notice_triggered_at"
    ].join(" "),
    [fingerprint, route, normalizedQuery, normalizedErrorMessage, windowSeconds]
  )) as SearchErrorIncidentRow[];

  const incident = rows[0];
  const shouldTrigger = Boolean(
    incident && incident.error_count >= threshold && !incident.notice_triggered_at
  );

  if (shouldTrigger) {
    await sql(
      [
        "update search_error_incidents",
        "set notice_triggered_at = now()",
        "where fingerprint = $1"
      ].join(" "),
      [fingerprint]
    );
  }

  return {
    count: incident?.error_count ?? 1,
    shouldTrigger
  };
}
