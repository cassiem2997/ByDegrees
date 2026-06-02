import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { subscribeMaintenanceEmail } from "@/lib/db/maintenance-subscribers";

const subscribeSchema = z.object({
  email: z.string().email().max(254)
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "이메일 주소를 확인해주세요." },
      { status: 400 }
    );
  }

  try {
    await subscribeMaintenanceEmail(parsed.data.email);
    return NextResponse.json({
      ok: true,
      message: "점검 완료 시 메일로 안내드려요."
    });
  } catch (error) {
    console.error("[maintenance-subscribe]", error);
    return NextResponse.json(
      { error: "알림 신청을 저장하지 못했어요. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
