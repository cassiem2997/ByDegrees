import { NextRequest, NextResponse } from "next/server";

import { deleteExpiredMaintenanceSubscribers } from "@/lib/db/maintenance-subscribers";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await deleteExpiredMaintenanceSubscribers();

  return NextResponse.json({
    ok: true,
    deleted
  });
}
