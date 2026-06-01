import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRequest } from "@/lib/admin-auth";
import { logEvent } from "@/lib/analytics";

const eventSchema = z.object({
  eventType: z.enum([
    "page_view",
    "create_board",
    "save_image",
    "share",
    "search_artist",
    "select_artist",
    "search_song",
    "select_song"
  ]),
  sessionId: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
  }

  if (isAdminRequest(request)) {
    return NextResponse.json({ ok: true, skipped: "admin" });
  }

  const requestMetadata = {
    country:
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("x-country") ??
      undefined,
    continent:
      request.headers.get("x-vercel-ip-continent") ??
      request.headers.get("x-continent") ??
      undefined,
    region:
      request.headers.get("x-vercel-ip-country-region") ??
      request.headers.get("x-region") ??
      undefined,
    user_agent: request.headers.get("user-agent") ?? undefined
  };

  await logEvent(parsed.data.eventType, parsed.data.sessionId, {
    ...requestMetadata,
    ...(parsed.data.metadata ?? {})
  });
  return NextResponse.json({ ok: true });
}
