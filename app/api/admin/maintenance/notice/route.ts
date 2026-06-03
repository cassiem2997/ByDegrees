import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-auth";
import {
  deactivateMaintenanceNotice,
  getMaintenanceNoticeState
} from "@/lib/db/maintenance-notice";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getMaintenanceNoticeState());
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deactivateMaintenanceNotice();
  return NextResponse.json(await getMaintenanceNoticeState());
}
