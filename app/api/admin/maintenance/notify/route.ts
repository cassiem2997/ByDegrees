import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-auth";
import { env } from "@/lib/config";
import { getPendingMaintenanceSubscribers } from "@/lib/db/maintenance-subscribers";
import { absoluteUrl } from "@/lib/utils";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batchSize = env.MAINTENANCE_NOTIFY_BATCH_SIZE ?? 100;
  const subscribers = await getPendingMaintenanceSubscribers(batchSize);
  const emails = subscribers.map((subscriber) => subscriber.email);
  const emailList = emails.join(", ");
  const subject = "기온별플리 점검이 완료됐어요";
  const body = [
    "기온별플리 점검이 완료됐어요.",
    `다시 이용하실 수 있습니다: ${absoluteUrl("/")}`,
    "",
    "이 메일은 점검 완료 알림 신청에 따라 1회 발송되었습니다."
  ].join("\n");

  const searchParams = new URLSearchParams({
    view: "cm",
    fs: "1",
    bcc: emails.join(","),
    su: subject,
    body
  });

  return NextResponse.json({
    count: emails.length,
    emails,
    emailList,
    subject,
    body,
    gmailUrl: `https://mail.google.com/mail/?${searchParams.toString()}`
  });
}
