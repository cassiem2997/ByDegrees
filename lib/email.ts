import { env } from "@/lib/config";
import { absoluteUrl } from "@/lib/utils";

type ResendSendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

export function canSendMaintenanceEmail() {
  return Boolean(process.env.RESEND_API_KEY && env.MAINTENANCE_EMAIL_FROM);
}

export async function sendMaintenanceCompleteEmail(to: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = env.MAINTENANCE_EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and MAINTENANCE_EMAIL_FROM are required");
  }

  const siteUrl = absoluteUrl("/");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: "기온별플리 점검이 완료됐어요",
      html: [
        "<div style=\"font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#1c1b1b;background:#fcf8f7;padding:32px;\">",
        "<div style=\"max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #eee3df;border-radius:20px;padding:28px;\">",
        "<h1 style=\"margin:0 0 12px;font-size:24px;line-height:1.25;\">점검이 완료됐어요</h1>",
        "<p style=\"margin:0 0 20px;font-size:15px;color:#5f5e5e;\">기온별플리를 다시 이용하실 수 있어요. 기다려주셔서 감사합니다.</p>",
        `<a href=\"${siteUrl}\" style=\"display:inline-block;border-radius:999px;background:#1a1a1a;color:#ffffff;padding:13px 20px;text-decoration:none;font-weight:700;\">기온별플리 열기</a>`,
        "<p style=\"margin:24px 0 0;font-size:12px;color:#9e9996;\">이 메일은 점검 완료 알림 신청에 따라 1회 발송되었습니다.</p>",
        "</div>",
        "</div>"
      ].join(""),
      text: `기온별플리 점검이 완료됐어요.\n다시 이용하실 수 있습니다: ${siteUrl}\n\n이 메일은 점검 완료 알림 신청에 따라 1회 발송되었습니다.`
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ResendSendResponse | null;
    throw new Error(error?.message ?? `Resend email failed (${response.status})`);
  }

  return (await response.json()) as ResendSendResponse;
}
