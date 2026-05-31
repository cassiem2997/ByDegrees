"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { BoardPreview } from "@/components/board-preview";
import { ShareChannelButtons } from "@/components/share-channel-buttons";
import { Button } from "@/components/ui/button";
import { shareToKakao } from "@/lib/kakao-share";
import { generateBoardPreviewDataUrl } from "@/lib/preview-canvas";
import { getOrCreateSessionId } from "@/lib/session";
import { BoardSummary } from "@/lib/types";

const PREVIEW_STORAGE_KEY = "temptracks-preview-board";
const PREVIEW_CAPTURE_WIDTH = 370;
const PREVIEW_CAPTURE_HEIGHT = Math.round((PREVIEW_CAPTURE_WIDTH * 16) / 9);

function buildShareCaption(boardTitle: string, artistName?: string) {
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

  return `${boardTitle}\n${tags.join(" ")}`;
}

function getAppShareUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
}

function buildXIntentUrl(text: string, url?: string) {
  const params = new URLSearchParams({ text });

  if (url) {
    params.set("url", url);
  }

  return `https://x.com/intent/tweet?${params.toString()}`;
}

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

export function LocalPreviewClient() {
  const [board, setBoard] = useState<BoardSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageError, setPreviewImageError] = useState("");
  const [showSaveHint, setShowSaveHint] = useState(false);

  useEffect(() => {
    const rawBoard = window.sessionStorage.getItem(PREVIEW_STORAGE_KEY);

    if (rawBoard) {
      try {
        setBoard(JSON.parse(rawBoard) as BoardSummary);
      } catch {
        setBoard(null);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!board || previewImageUrl || previewImageError) return;

    let canceled = false;

    generateBoardPreviewDataUrl(board)
      .then((dataUrl) => {
        if (!canceled) setPreviewImageUrl(dataUrl);
      })
      .catch((error) => {
        console.error("Failed to create preview image", error);
        if (!canceled) setPreviewImageError("이미지를 준비하지 못했어요. 새로고침 후 다시 시도해주세요.");
      });

    return () => {
      canceled = true;
    };
  }, [board, previewImageError, previewImageUrl]);

  useEffect(() => {
    if (!showSaveHint) return;

    const timeout = window.setTimeout(() => {
      setShowSaveHint(false);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [showSaveHint]);

  if (!loaded) {
    return <div className="min-h-screen bg-[#fcf8f7]" />;
  }

  if (!board) {
    return (
      <main className="min-h-screen bg-[#fcf8f7] text-[#1c1b1b]">
        <div className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col items-center justify-center px-10 text-center">
          <p className="text-[22px] font-bold tracking-[-0.05em]">미리보기 데이터가 없어요.</p>
          <Link
            className="mt-8 rounded-full bg-[#1a1a1a] px-8 py-4 text-sm font-bold text-white"
            href="/create"
          >
            다시 만들기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcf8f7] text-[#1c1b1b]">
      <div className="mx-auto min-h-screen w-full max-w-[450px] pb-24 pt-6">
        {previewImageUrl ? (
          <img
            alt={`${board.title} 미리보기 이미지`}
            className="mx-auto w-full max-w-[370px] rounded-[2px]"
            src={previewImageUrl}
          />
        ) : previewImageError ? (
          <p className="mx-auto max-w-[320px] rounded-[20px] bg-white/70 p-5 text-center text-sm font-semibold text-[#ba1a1a]">
            {previewImageError}
          </p>
        ) : (
          <div className="mx-auto flex aspect-[9/16] w-full max-w-[370px] items-center justify-center bg-white/35 text-[13px] font-semibold text-[#b7b2af]">
            미리보기 이미지를 준비 중이에요.
          </div>
        )}
        <div className="pointer-events-none fixed -left-[9999px] top-0 w-[370px] overflow-hidden">
          <div
            className="bg-[#fcf8f7]"
            id="board-capture"
            style={{
              height: PREVIEW_CAPTURE_HEIGHT,
              width: PREVIEW_CAPTURE_WIDTH
            }}
          >
            <BoardPreview
              artistName={board.artistName}
              rows={board.rows}
              title={board.title}
            />
          </div>
        </div>

        <div className="relative mt-8 px-6 sm:px-10">
          {showSaveHint ? (
            <p className="pointer-events-none absolute bottom-[calc(100%+16px)] left-1/2 z-10 w-fit max-w-[calc(100%-24px)] -translate-x-1/2 rounded-full bg-[rgba(216,211,208,0.86)] px-5 py-3 text-center text-[14px] font-semibold leading-[1.35] text-[#1c1b1b] opacity-100 shadow-[0_14px_28px_rgba(0,0,0,0.13)] backdrop-blur-sm after:absolute after:left-1/2 after:top-full after:h-0 after:w-0 after:-translate-x-1/2 after:border-x-[14px] after:border-t-[14px] after:border-x-transparent after:border-t-[rgba(216,211,208,0.86)]">
              위 이미지를 길게 눌러
              <br />
              저장하세요.
            </p>
          ) : null}
          <LocalPreviewActions
            artistName={board.artistName}
            boardTitle={board.title}
            onSaveHint={() => setShowSaveHint(true)}
            previewImageReady={Boolean(previewImageUrl)}
            showSaveHint={showSaveHint}
          />
        </div>
      </div>
    </main>
  );
}

function LocalPreviewActions({
  artistName,
  boardTitle,
  onSaveHint,
  previewImageReady,
  showSaveHint
}: {
  artistName: string;
  boardTitle: string;
  onSaveHint: () => void;
  previewImageReady: boolean;
  showSaveHint: boolean;
}) {
  const [saveError, setSaveError] = useState("");
  const appShareUrl = getAppShareUrl();
  const shareCaption = buildShareCaption(boardTitle, artistName);

  async function copyShareCaption() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(shareCaption);
  }

  async function handleDownload() {
    if (!previewImageReady) {
      setSaveError("이미지 미리보기를 준비 중이에요. 잠시 후 다시 눌러주세요.");
      return;
    }

    setSaveError("");
    onSaveHint();

    await logClientEvent("save_image", {
      board_id: "local-preview",
      board_slug: "preview",
      board_title: boardTitle
    });
  }

  async function handleInstagramShare() {
    await handleDownload();
    await copyShareCaption();
    await logClientEvent("share", {
      board_id: "local-preview",
      board_slug: "preview",
      channel: "instagram_caption"
    });
  }

  async function handleKakaoShare() {
    const didOpenKakaoShare = await shareToKakao({
      title: boardTitle,
      description: shareCaption,
      url: appShareUrl,
      imageUrl: `${window.location.origin}/images/gion-logo-transparent.png`
    });

    if (!didOpenKakaoShare) {
      if ("share" in navigator) {
        await navigator.share({
          title: boardTitle,
          text: shareCaption,
          url: appShareUrl
        });
      } else {
        await copyShareCaption();
      }
    }

    await logClientEvent("share", {
      board_id: "local-preview",
      board_slug: "preview",
      channel: didOpenKakaoShare ? "kakao" : "kakao_fallback"
    });
  }

  async function handleXShare() {
    window.open(buildXIntentUrl(shareCaption, appShareUrl), "_blank", "noopener,noreferrer");
    await logClientEvent("share", {
      board_id: "local-preview",
      board_slug: "preview",
      channel: "x_intent"
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
      <ShareChannelButtons
        onInstagramShare={handleInstagramShare}
        onKakaoShare={handleKakaoShare}
        onXShare={handleXShare}
      />
    </div>
  );
}
