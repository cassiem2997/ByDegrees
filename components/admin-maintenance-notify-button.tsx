"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminMaintenanceNotifyButton({
  disabled,
  pendingCount
}: {
  disabled: boolean;
  pendingCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSend() {
    if (pendingCount === 0) return;

    const confirmed = window.confirm(
      `점검 완료 메일을 ${pendingCount}명에게 발송할까요? 발송 성공 대상은 notified_at이 기록됩니다.`
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
        sent?: number;
        failed?: number;
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "메일 발송에 실패했어요.");
        return;
      }

      setMessage(`${data.sent ?? 0}명에게 발송 완료, 실패 ${data.failed ?? 0}건`);
      router.refresh();
    } catch {
      setError("네트워크 오류로 메일 발송에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        className="h-11 rounded-full bg-ink px-5 text-sm font-bold text-white shadow-none hover:translate-y-0 hover:bg-ink"
        disabled={disabled || loading || pendingCount === 0}
        onClick={handleSend}
        type="button"
      >
        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        점검 완료 메일 보내기
      </Button>
      {message ? <p className="text-xs font-semibold text-[#2f7b57]">{message}</p> : null}
      {error ? <p className="text-xs font-semibold text-[#ba1a1a]">{error}</p> : null}
    </div>
  );
}
