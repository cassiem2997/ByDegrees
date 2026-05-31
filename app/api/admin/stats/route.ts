import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getAdminSummary } from "@/lib/analytics";
import { normalizeAdminPeriod } from "@/lib/admin-period";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("temptracks_admin")?.value === "true";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await getAdminSummary(
    normalizeAdminPeriod(
      request.nextUrl.searchParams.get("period"),
      request.nextUrl.searchParams.get("date")
    )
  );
  return NextResponse.json(summary);
}
