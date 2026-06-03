import { notifyMusicSearchFailure } from "@/lib/alerts";
import { activateMaintenanceNotice } from "@/lib/db/maintenance-notice";

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

  await activateMaintenanceNotice({
    reason: "music-search-error",
    route,
    query,
    errorMessage
  });

  await notifyMusicSearchFailure({
    route,
    query,
    errorMessage
  });
}
