import { getSql } from "@/lib/db";

export type ActiveServiceRateLimit = {
  retryAfterSeconds: number;
  retryAfterUntil: string;
};

type RateLimitRow = {
  retry_after_seconds: number;
  retry_after_until: string;
};

export async function getActiveServiceRateLimit(
  service: string
): Promise<ActiveServiceRateLimit | null> {
  try {
    const sql = getSql();
    const rows = (await sql(
      [
        "select",
        "greatest(0, ceil(extract(epoch from (retry_after_until - now()))))::int as retry_after_seconds,",
        "retry_after_until",
        "from service_rate_limits",
        "where service = $1",
        "and retry_after_until > now()",
        "limit 1"
      ].join(" "),
      [service]
    )) as RateLimitRow[];

    const row = rows[0];
    if (!row) return null;

    return {
      retryAfterSeconds: row.retry_after_seconds,
      retryAfterUntil: row.retry_after_until
    };
  } catch {
    return null;
  }
}

export async function setServiceRateLimit(
  service: string,
  retryAfterSeconds: number | null
) {
  if (!retryAfterSeconds || retryAfterSeconds <= 0) return;

  try {
    const sql = getSql();
    await sql(
      [
        "insert into service_rate_limits",
        "(service, retry_after_until, last_retry_after_seconds)",
        "values ($1, now() + ($2 || ' seconds')::interval, $2)",
        "on conflict (service) do update set",
        "retry_after_until = greatest(service_rate_limits.retry_after_until, excluded.retry_after_until),",
        "last_retry_after_seconds = excluded.last_retry_after_seconds,",
        "updated_at = now()"
      ].join(" "),
      [service, retryAfterSeconds]
    );
  } catch {
    // Rate-limit bookkeeping should never block normal search handling.
  }
}
