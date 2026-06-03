"use client";

import { useState } from "react";
import { Copy, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminMaintenanceNotifyButton({
  pendingCount
}: {
  pendingCount: number;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSend() {
    if (pendingCount === 0) return;

    const confirmed = window.confirm(
      `미발송 이메일 ${pendingCount}개를 복사하고 Gmail 작성창을 열까요? 받는 사람은 BCC로 들어갑니다.`
    );
    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/maintenance/notify", {
        method: "POST"
      });
      const data = (await response.json()) as {
        count?: number;
        emailList?: string;
        gmailUrl?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "이메일 목록을 불러오지 못했어요.");
        return;
      }

      if (!data.count || !data.emailList || !data.gmailUrl) {
        setMessage("미발송 이메일이 없어요.");
        return;
      }

      try {
        await navigator.clipboard.writeText(data.emailList);
      } catch {
        // Gmail prefill still works when clipboard access is blocked.
      }

      window.open(data.gmailUrl, "_blank", "noopener,noreferrer");
      setMessage(`${data.count}개 주소를 복사하고 Gmail 작성창을 열었어요. 발송 후 notified_at은 별도로 처리해주세요.`);
    } catch {
      setError("네트워크 오류로 이메일 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        className="h-11 rounded-full bg-ink px-5 text-sm font-bold text-white shadow-none hover:translate-y-0 hover:bg-ink"
        disabled={loading || pendingCount === 0}
        onClick={handleSend}
        type="button"
      >
        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
        Gmail로 열기
      </Button>
      {message ? <p className="text-xs font-semibold text-[#2f7b57]">{message}</p> : null}
      {error ? <p className="text-xs font-semibold text-[#ba1a1a]">{error}</p> : null}
    </div>
  );
}
