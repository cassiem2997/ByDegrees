import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-auth";
import { env } from "@/lib/config";
import {
  getMaintenanceSubscriberStats,
  getPendingMaintenanceSubscribers,
  markMaintenanceSubscribersNotified
} from "@/lib/db/maintenance-subscribers";
import { canSendMaintenanceEmail, sendMaintenanceCompleteEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canSendMaintenanceEmail()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY와 MAINTENANCE_EMAIL_FROM을 설정해주세요." },
      { status: 400 }
    );
  }

  const batchSize = env.MAINTENANCE_NOTIFY_BATCH_SIZE ?? 100;
  const subscribers = await getPendingMaintenanceSubscribers(batchSize);
  const notifiedIds: string[] = [];
  const failures: Array<{ email: string; error: string }> = [];

  for (const subscriber of subscribers) {
    try {
      await sendMaintenanceCompleteEmail(subscriber.email);
      notifiedIds.push(subscriber.id);
    } catch (error) {
      failures.push({
        email: subscriber.email,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  await markMaintenanceSubscribersNotified(notifiedIds);

  const stats = await getMaintenanceSubscriberStats();
  return NextResponse.json({
    sent: notifiedIds.length,
    failed: failures.length,
    failures: failures.slice(0, 5),
    stats
  });
}
