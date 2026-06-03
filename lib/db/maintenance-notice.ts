import { getSql } from "@/lib/db";

export type MaintenanceNoticeState = {
  active: boolean;
  reason: string | null;
  route: string | null;
  query: string | null;
  errorMessage: string | null;
  triggeredAt: string | null;
  resolvedAt: string | null;
};

type MaintenanceNoticeRow = {
  active: boolean;
  reason: string | null;
  route: string | null;
  query: string | null;
  error_message: string | null;
  triggered_at: string | null;
  resolved_at: string | null;
};

function mapNotice(row?: MaintenanceNoticeRow): MaintenanceNoticeState {
  return {
    active: row?.active ?? false,
    reason: row?.reason ?? null,
    route: row?.route ?? null,
    query: row?.query ?? null,
    errorMessage: row?.error_message ?? null,
    triggeredAt: row?.triggered_at ?? null,
    resolvedAt: row?.resolved_at ?? null
  };
}

export async function getMaintenanceNoticeState() {
  try {
    const sql = getSql();
    const rows = (await sql(
      [
        "select active, reason, route, query, error_message, triggered_at, resolved_at",
        "from maintenance_notice",
        "where id = 'global'",
        "limit 1"
      ].join(" ")
    )) as MaintenanceNoticeRow[];

    return mapNotice(rows[0]);
  } catch {
    return mapNotice();
  }
}

export async function activateMaintenanceNotice({
  reason,
  route,
  query,
  errorMessage
}: {
  reason: string;
  route: string;
  query: string;
  errorMessage: string;
}) {
  try {
    const sql = getSql();
    await sql(
      [
        "insert into maintenance_notice",
        "(id, active, reason, route, query, error_message, triggered_at, resolved_at, updated_at)",
        "values ('global', true, $1, $2, $3, $4, now(), null, now())",
        "on conflict (id) do update set",
        "active = true,",
        "reason = excluded.reason,",
        "route = excluded.route,",
        "query = excluded.query,",
        "error_message = excluded.error_message,",
        "triggered_at = now(),",
        "resolved_at = null,",
        "updated_at = now()"
      ].join(" "),
      [reason, route, query, errorMessage.slice(0, 1000)]
    );
  } catch (error) {
    console.warn("[maintenance-notice-activate]", error);
  }
}

export async function deactivateMaintenanceNotice() {
  const sql = getSql();
  await sql(
    [
      "insert into maintenance_notice (id, active, resolved_at, updated_at)",
      "values ('global', false, now(), now())",
      "on conflict (id) do update set",
      "active = false,",
      "resolved_at = now(),",
      "updated_at = now()"
    ].join(" ")
  );
}
