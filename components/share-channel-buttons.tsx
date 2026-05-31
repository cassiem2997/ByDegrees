"use client";

import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";

type ShareChannelButtonsProps = {
  onCopyLink: () => void | Promise<void>;
  onXShare: () => void | Promise<void>;
};

export function ShareChannelButtons({
  onCopyLink,
  onXShare
}: ShareChannelButtonsProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => {
      setCopied(false);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleCopyLink() {
    await onCopyLink();
    setCopied(true);
  }

  return (
    <div className="rounded-[26px] border border-[#e6dfdc] bg-white/45 px-5 py-4 text-center backdrop-blur-sm">
      <p className="text-[13px] font-bold tracking-[-0.03em] text-[#4f4a47]">
        내 기온별플리 공유하기
      </p>
      <div className="mt-4 flex items-center justify-center gap-2.5">
        <button
          aria-label="X 공유"
          className="flex h-11 min-w-[96px] items-center justify-center gap-2 rounded-full bg-[#1a1a1a] px-4 text-[13px] font-bold tracking-[-0.03em] text-white shadow-[0_10px_22px_rgba(0,0,0,0.10)] transition active:scale-95"
          onClick={onXShare}
          type="button"
        >
          <span className="text-[18px] leading-none text-white" aria-hidden="true">
            X
          </span>
          X 공유
        </button>
        <button
          aria-label="링크 복사"
          className="flex h-11 min-w-[112px] items-center justify-center gap-2 rounded-full bg-[#1a1a1a] px-4 text-[13px] font-bold tracking-[-0.03em] text-white shadow-[0_10px_22px_rgba(0,0,0,0.10)] transition active:scale-95"
          onClick={handleCopyLink}
          type="button"
        >
          <Link2 className="h-4 w-4" />
          {copied ? "복사됨" : "링크 복사"}
        </button>
      </div>
    </div>
  );
}
