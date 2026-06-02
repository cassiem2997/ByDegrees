import { getSql } from "@/lib/db";

export type MaintenanceSubscriber = {
  id: string;
  email: string;
};

type MaintenanceSubscriberStatsRow = {
  total_count: string | number;
  pending_count: string | number;
  notified_count: string | number;
};

function toNumber(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

export function normalizeSubscriberEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function subscribeMaintenanceEmail(email: string) {
  const sql = getSql();
  const normalizedEmail = normalizeSubscriberEmail(email);
  const rows = (await sql(
    [
      "insert into maintenance_subscribers (email)",
      "values ($1)",
      "on conflict (email) do update set updated_at = now()",
      "returning id, email, notified_at"
    ].join(" "),
    [normalizedEmail]
  )) as Array<{ id: string; email: string; notified_at: string | null }>;

  return rows[0];
}

export async function getMaintenanceSubscriberStats() {
  try {
    const sql = getSql();
    const rows = (await sql(
      [
        "select",
        "count(*) as total_count,",
        "count(*) filter (where notified_at is null) as pending_count,",
        "count(*) filter (where notified_at is not null) as notified_count",
        "from maintenance_subscribers"
      ].join(" ")
    )) as MaintenanceSubscriberStatsRow[];

    const row = rows[0];
    return {
      total: toNumber(row?.total_count),
      pending: toNumber(row?.pending_count),
      notified: toNumber(row?.notified_count)
    };
  } catch {
    return {
      total: 0,
      pending: 0,
      notified: 0
    };
  }
}

export async function getPendingMaintenanceSubscribers(limit: number) {
  const sql = getSql();
  return (await sql(
    [
      "select id, email",
      "from maintenance_subscribers",
      "where notified_at is null",
      "order by created_at asc",
      "limit $1"
    ].join(" "),
    [limit]
  )) as MaintenanceSubscriber[];
}

export async function markMaintenanceSubscribersNotified(ids: string[]) {
  if (ids.length === 0) return;

  const sql = getSql();
  await sql(
    [
      "update maintenance_subscribers",
      "set notified_at = now(), updated_at = now()",
      "where id = any($1::uuid[])"
    ].join(" "),
    [ids]
  );
}
