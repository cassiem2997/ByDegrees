import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-auth";
import { logEvent } from "@/lib/analytics";
import { notifySpotifyRateLimit } from "@/lib/alerts";
import { triggerMaintenanceNoticeForSearchError } from "@/lib/maintenance";
import { getMusicProvider } from "@/lib/providers/music";
import { isSpotifyRateLimitError } from "@/lib/providers/music/spotify";

function getActiveMusicProviderName() {
  return process.env.MUSIC_PROVIDER ?? process.env.NEXT_PUBLIC_MUSIC_PROVIDER ?? "itunes";
}

export async function handleMusicArtistSearch(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const sessionId =
    request.nextUrl.searchParams.get("sessionId") ?? "anonymous-session";

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  try {
    const provider = getMusicProvider();
    const items = await provider.searchArtists(query);

    if (!isAdminRequest(request)) {
      await logEvent("search_artist", sessionId, {
        query,
        provider: getActiveMusicProviderName()
      });
    }

    return NextResponse.json({ items });
  } catch (error) {
    if (isSpotifyRateLimitError(error)) {
      console.warn("[music-artist-search-rate-limit]", error);
      await triggerMaintenanceNoticeForSearchError({
        route: "/api/music/artists",
        query,
        error
      });
      await notifySpotifyRateLimit({
        route: "/api/music/artists",
        query,
        retryAfterSeconds: error.retryAfterSeconds
      });
      return NextResponse.json(
        {
          items: [],
          error: "음악 검색 요청이 몰려 잠시 쉬는 중이에요.\n잠시 후 다시 시도해주세요.",
          retryAfterSeconds: error.retryAfterSeconds
        },
        { status: 429 }
      );
    }

    console.error("[music-artist-search]", error);
    await triggerMaintenanceNoticeForSearchError({
      route: "/api/music/artists",
      query,
      error
    });
    return NextResponse.json(
      {
        items: [],
        error: "음악 검색 연결이 잠시 불안정해요. 다시 검색해보세요."
      },
      { status: 500 }
    );
  }
}

export async function handleMusicTrackSearch(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const sessionId =
    request.nextUrl.searchParams.get("sessionId") ?? "anonymous-session";

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  try {
    const provider = getMusicProvider();
    const items = await provider.searchTracks(query);

    if (!isAdminRequest(request)) {
      await logEvent("search_song", sessionId, {
        query,
        provider: getActiveMusicProviderName()
      });
    }

    return NextResponse.json({ items });
  } catch (error) {
    if (isSpotifyRateLimitError(error)) {
      console.warn("[music-search-rate-limit]", error);
      await triggerMaintenanceNoticeForSearchError({
        route: "/api/music/search",
        query,
        error
      });
      await notifySpotifyRateLimit({
        route: "/api/music/search",
        query,
        retryAfterSeconds: error.retryAfterSeconds
      });
      return NextResponse.json(
        {
          items: [],
          error: "음악 검색 요청이 몰려 잠시 쉬는 중이에요.\n잠시 후 다시 시도해주세요.",
          retryAfterSeconds: error.retryAfterSeconds
        },
        { status: 429 }
      );
    }

    console.error("[music-search]", error);
    await triggerMaintenanceNoticeForSearchError({
      route: "/api/music/search",
      query,
      error
    });
    return NextResponse.json(
      {
        items: [],
        error: "음악 검색 연결이 잠시 불안정해요. 다시 검색해보세요."
      },
      { status: 500 }
    );
  }
}
