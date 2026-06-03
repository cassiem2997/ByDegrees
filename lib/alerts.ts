import { env } from "@/lib/config";

type SpotifyRateLimitAlert = {
  route: string;
  query: string;
  retryAfterSeconds: number | null;
};

type MusicSearchFailureAlert = {
  route: string;
  query: string;
  errorMessage: string;
};

const DEFAULT_ALERT_COOLDOWN_SECONDS = 30 * 60;
const alertCooldowns = new Map<string, number>();

function shouldSendAlert(key: string) {
  const now = Date.now();
  const cooldownSeconds =
    env.ALERT_COOLDOWN_SECONDS ?? DEFAULT_ALERT_COOLDOWN_SECONDS;
  const nextAllowedAt = alertCooldowns.get(key) ?? 0;

  if (nextAllowedAt > now) return false;

  alertCooldowns.set(key, now + cooldownSeconds * 1000);
  return true;
}

function formatRetryAfter(seconds: number | null) {
  if (seconds === null) return "unknown";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

export async function notifySpotifyRateLimit({
  route,
  query,
  retryAfterSeconds
}: SpotifyRateLimitAlert) {
  const webhookUrl = env.DISCORD_ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  const alertKey = `spotify-rate-limit:${route}`;
  if (!shouldSendAlert(alertKey)) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: [
          "🚨 Spotify 검색 429 감지",
          `route: ${route}`,
          `query: ${query}`,
          `retryAfter: ${formatRetryAfter(retryAfterSeconds)}`
        ].join("\n")
      }),
      signal: AbortSignal.timeout(2500)
    });
  } catch (error) {
    console.warn("[discord-alert]", error);
  }
}

export async function notifyMusicSearchFailure({
  route,
  query,
  errorMessage
}: MusicSearchFailureAlert) {
  const webhookUrl = env.DISCORD_ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  const alertKey = `music-search-failure:${route}`;
  if (!shouldSendAlert(alertKey)) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: [
          "🚨 음악 검색 오류 감지 - 랜딩 점검 공지 ON",
          `route: ${route}`,
          `query: ${query}`,
          `error: ${errorMessage.slice(0, 500)}`
        ].join("\n")
      }),
      signal: AbortSignal.timeout(2500)
    });
  } catch (error) {
    console.warn("[discord-alert]", error);
  }
}
