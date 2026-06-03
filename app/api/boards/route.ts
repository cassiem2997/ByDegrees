import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRequest } from "@/lib/admin-auth";
import { logEvent } from "@/lib/analytics";
import { createBoard } from "@/lib/db/queries";

const songSchema = z.object({
  provider: z.literal("spotify"),
  providerTrackId: z.string(),
  title: z.string().optional().default(""),
  artistName: z.string().optional().default(""),
  albumName: z.string().optional().default(""),
  albumArtUrl: z.string().nullable().optional().transform((value) => value ?? ""),
  externalUrl: z.string().nullable().optional().transform((value) => value ?? ""),
  previewUrl: z.string().nullable().optional().transform((value) => value ?? null)
});

const payloadSchema = z.object({
  title: z.string().min(1),
  artistName: z.string().min(1),
  isPublic: z.boolean(),
  templateKey: z.string().min(1),
  sessionId: z.string().min(1),
  rows: z.array(
    z.object({
      temperaturePresetId: z.string().min(1),
      songs: z.array(songSchema.nullable()).length(3)
    })
  )
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    console.error("[create-board-invalid-payload]", parsed.error.flatten());
    return NextResponse.json(
      {
        error: "플레이리스트 데이터를 확인하지 못했어요. 다시 시도해주세요.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const isInternal = isAdminRequest(request);
    const board = await createBoard(parsed.data, { isInternal });

    if (!isInternal) {
      await logEvent("create_board", parsed.data.sessionId, {
        artist: parsed.data.artistName,
        board_id: board.id,
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
        title: parsed.data.title
      });
    }

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("[create-board]", error);
    return NextResponse.json(
      { error: "플레이리스트 이미지를 생성하지 못했어요. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
