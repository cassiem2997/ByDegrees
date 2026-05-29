import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getAdminSummary } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("temptracks_admin")?.value === "true";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = Number(request.nextUrl.searchParams.get("days") ?? "7");
  const summary = await getAdminSummary(days);
  return NextResponse.json(summary);
}
