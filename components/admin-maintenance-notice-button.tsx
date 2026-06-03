"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminMaintenanceNoticeButton({
  active
}: {
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDisable() {
    const confirmed = window.confirm("랜딩 점검 공지를 내릴까요?");
    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/maintenance/notice", {
        method: "POST"
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "점검 공지를 내리지 못했어요.");
        return;
      }

      router.refresh();
    } catch {
      setError("네트워크 오류로 점검 공지를 내리지 못했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        className="h-11 rounded-full bg-ink px-5 text-sm font-bold text-white shadow-none hover:translate-y-0 hover:bg-ink"
        disabled={!active || loading}
        onClick={handleDisable}
        type="button"
      >
        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
        점검 공지 내리기
      </Button>
      {error ? <p className="text-xs font-semibold text-[#ba1a1a]">{error}</p> : null}
    </div>
  );
}
