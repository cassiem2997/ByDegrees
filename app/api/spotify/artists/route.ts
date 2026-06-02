import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-auth";
import { logEvent } from "@/lib/analytics";
import { notifySpotifyRateLimit } from "@/lib/alerts";
import { getMusicProvider } from "@/lib/providers/music";
import { isSpotifyRateLimitError } from "@/lib/providers/music/spotify";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const sessionId =
    request.nextUrl.searchParams.get("sessionId") ?? "anonymous-session";

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  try {
    const provider = getMusicProvider("spotify");
    const items = await provider.searchArtists(query);

    if (!isAdminRequest(request)) {
      await logEvent("search_artist", sessionId, {
        query,
        provider: process.env.MUSIC_PROVIDER ?? process.env.NEXT_PUBLIC_MUSIC_PROVIDER ?? "itunes"
      });
    }

    return NextResponse.json({ items });
  } catch (error) {
    if (isSpotifyRateLimitError(error)) {
      console.warn("[spotify-artist-search-rate-limit]", error);
      await notifySpotifyRateLimit({
        route: "/api/spotify/artists",
        query,
        retryAfterSeconds: error.retryAfterSeconds
      });
      return NextResponse.json(
        {
          items: [],
          error: "Spotify 검색이 요청이 몰려 잠시 쉬는 중이에요.\n잠시 후 다시 시도해주세요.",
          retryAfterSeconds: error.retryAfterSeconds
        },
        { status: 429 }
      );
    }

    console.error("[spotify-artist-search]", error);
    return NextResponse.json(
      {
        items: [],
        error: "음악 검색 연결이 잠시 불안정해요. 다시 검색해보세요."
      },
      { status: 500 }
    );
  }
}
