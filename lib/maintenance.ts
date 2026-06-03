import { notifyMusicSearchFailure } from "@/lib/alerts";
import { env } from "@/lib/config";
import { activateMaintenanceNotice } from "@/lib/db/maintenance-notice";
import { recordSearchErrorIncident } from "@/lib/db/search-error-incidents";

const DEFAULT_SEARCH_ERROR_NOTICE_THRESHOLD = 3;
const DEFAULT_SEARCH_ERROR_NOTICE_WINDOW_SECONDS = 10 * 60;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown search error";
}

export async function triggerMaintenanceNoticeForSearchError({
  route,
  query,
  error
}: {
  route: string;
  query: string;
  error: unknown;
}) {
  const errorMessage = getErrorMessage(error);
  const threshold =
    env.SEARCH_ERROR_NOTICE_THRESHOLD ?? DEFAULT_SEARCH_ERROR_NOTICE_THRESHOLD;
  const windowSeconds =
    env.SEARCH_ERROR_NOTICE_WINDOW_SECONDS ?? DEFAULT_SEARCH_ERROR_NOTICE_WINDOW_SECONDS;

  let incident: { count: number; shouldTrigger: boolean };
  try {
    incident = await recordSearchErrorIncident({
      route,
      query,
      errorMessage,
      threshold,
      windowSeconds
    });
  } catch (recordError) {
    console.warn("[search-error-incident-record]", recordError);
    return;
  }

  if (!incident.shouldTrigger) {
    console.warn("[music-search-error-threshold-pending]", {
      route,
      query,
      count: incident.count,
      threshold,
      errorMessage
    });
    return;
  }

  await activateMaintenanceNotice({
    reason: "music-search-error",
    route,
    query,
    errorMessage: `${errorMessage} (repeated ${incident.count} times within ${windowSeconds}s)`
  });

  await notifyMusicSearchFailure({
    route,
    query,
    errorMessage: `${errorMessage} (repeated ${incident.count} times within ${windowSeconds}s)`
  });
}
