import { NextRequest, NextResponse } from "next/server";

import { logEvent } from "@/lib/analytics";
import { getMusicProvider } from "@/lib/providers/music";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const sessionId =
    request.nextUrl.searchParams.get("sessionId") ?? "anonymous-session";

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  try {
    const provider = getMusicProvider("spotify");
    const items = await provider.searchTracks(query);

    await logEvent("search_song", sessionId, {
      query,
      provider: "spotify"
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[spotify-search]", error);
    return NextResponse.json(
      {
        items: [],
        error: "Spotify 연결이 잠시 불안정해요. 다시 검색해보세요."
      },
      { status: 500 }
    );
  }
}
