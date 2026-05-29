"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { ShareChannelButtons } from "@/components/share-channel-buttons";
import { Button } from "@/components/ui/button";
import { captureElementAsPngDataUrl } from "@/lib/image-file";
import { shareToKakao } from "@/lib/kakao-share";
import { getOrCreateSessionId } from "@/lib/session";

async function logClientEvent(eventType: string, metadata: Record<string, unknown>) {
  const sessionId = getOrCreateSessionId();

  await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      eventType,
      sessionId,
      metadata
    })
  });
}

function buildShareCaption(boardTitle: string, artistName?: string, boardUrl?: string) {
  const cleanArtistName =
    artistName && artistName !== "Various Artists"
      ? artistName.replace(/[^\p{L}\p{N}]/gu, "")
      : "";
  const englishArtistName =
    artistName && artistName !== "Various Artists"
      ? artistName.replace(/[^a-zA-Z0-9]/g, "")
      : "";
  const tags = [
    "#기온별플리",
    cleanArtistName ? `#기온별${cleanArtistName}` : "",
    englishArtistName ? `#${englishArtistName}ByDegrees` : ""
  ].filter(Boolean);

  return [boardTitle, tags.join(" "), boardUrl].filter(Boolean).join("\n");
}

function buildXIntentUrl(text: string, url?: string) {
  const params = new URLSearchParams({ text });

  if (url) {
    params.set("url", url);
  }

  return `https://x.com/intent/tweet?${params.toString()}`;
}

export function ShareActions({
  artistName,
  boardTitle,
  boardSlug,
  boardId,
  captureId
}: {
  artistName: string;
  boardTitle: string;
  boardSlug: string;
  boardId: string;
  captureId: string;
}) {
  const [savedImageUrl, setSavedImageUrl] = useState("");
  const [saveError, setSaveError] = useState("");
  const boardUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/boards/${boardSlug}`
      : `/boards/${boardSlug}`;
  const shareCaption = buildShareCaption(boardTitle, artistName, boardUrl);
  const twitterIntentUrl = buildXIntentUrl(
    buildShareCaption(boardTitle, artistName),
    boardUrl
  );

  async function copyShareCaption() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(shareCaption);
  }

  async function handleDownload() {
    const element = document.getElementById(captureId);
    if (!element) return;

    try {
      setSaveError("");
      const dataUrl = await captureElementAsPngDataUrl(element);
      setSavedImageUrl(dataUrl);
    } catch {
      setSaveError("이미지를 준비하지 못했어요. 새로고침 후 다시 시도해주세요.");
      return;
    }

    await logClientEvent("save_image", {
      board_id: boardId,
      board_slug: boardSlug,
      board_title: boardTitle
    });
  }

  async function handleTwitterShare() {
    window.open(twitterIntentUrl, "_blank", "noopener,noreferrer");
    await logClientEvent("share", {
      board_id: boardId,
      board_slug: boardSlug,
      channel: "twitter_intent"
    });
  }

  async function handleInstagramShare() {
    await handleDownload();
    await copyShareCaption();
    await logClientEvent("share", {
      board_id: boardId,
      board_slug: boardSlug,
      channel: "instagram_caption"
    });
  }

  async function handleKakaoShare() {
    const didOpenKakaoShare = await shareToKakao({
      title: boardTitle,
      description: shareCaption,
      url: boardUrl,
      imageUrl: `${window.location.origin}/images/gion-logo-transparent.png`
    });

    if (didOpenKakaoShare) {
      await logClientEvent("share", {
        board_id: boardId,
        board_slug: boardSlug,
        channel: "kakao"
      });
      return;
    }

    if ("share" in navigator) {
      await navigator.share({
        title: boardTitle,
        text: shareCaption,
        url: boardUrl
      });
    } else {
      await copyShareCaption();
    }

    await logClientEvent("share", {
      board_id: boardId,
      board_slug: boardSlug,
      channel: "kakao_fallback"
    });
  }

  return (
    <div className="space-y-4">
      <Button
        className="h-16 w-full gap-3 rounded-full bg-[#1a1a1a] text-[15px] font-bold tracking-[-0.03em] text-white shadow-[0_18px_30px_rgba(0,0,0,0.18)] hover:translate-y-0 hover:bg-[#1a1a1a]"
        onClick={handleDownload}
      >
        <Download className="h-5 w-5" />
        내 기온별플리 저장하기
      </Button>
      {saveError ? (
        <p className="text-center text-xs font-medium text-[#ba1a1a]">{saveError}</p>
      ) : null}
      {savedImageUrl ? (
        <div className="rounded-[20px] border border-black/[0.05] bg-white/75 p-3 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
          <img
            alt={`${boardTitle} 저장용 이미지`}
            className="mx-auto w-full max-w-[260px] rounded-[14px]"
            src={savedImageUrl}
          />
          <p className="mt-3 text-xs font-semibold text-[#77716e]">
            이미지를 길게 눌러 사진 앱에 저장하세요.
          </p>
        </div>
      ) : null}
      <ShareChannelButtons
        onInstagramShare={handleInstagramShare}
        onKakaoShare={handleKakaoShare}
        onXShare={handleTwitterShare}
      />
    </div>
  );
}
