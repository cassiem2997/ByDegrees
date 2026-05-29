import { NextRequest, NextResponse } from "next/server";

import { getBoardBySlug } from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);

  if (!board) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(board);
}
