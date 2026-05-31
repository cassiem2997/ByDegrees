"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { BoardPreview } from "@/components/board-preview";
import { ShareChannelButtons } from "@/components/share-channel-buttons";
import { Button } from "@/components/ui/button";
import { captureElementAsPngDataUrl } from "@/lib/image-file";
import { getOrCreateSessionId } from "@/lib/session";
import { BoardSummary } from "@/lib/types";

const PREVIEW_STORAGE_KEY = "temptracks-preview-board";
const PREVIEW_CAPTURE_WIDTH = 370;
const PREVIEW_CAPTURE_HEIGHT = Math.round((PREVIEW_CAPTURE_WIDTH * 16) / 9);

async function waitForPreviewAssets(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();

      return new Promise<void>((resolve) => {
        const timeout = window.setTimeout(resolve, 1500);
        const finish = () => {
          window.clearTimeout(timeout);
          resolve();
        };

        image.addEventListener("load", finish, { once: true });
        image.addEventListener("error", finish, { once: true });
      });
    })
  );
}

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

function buildXIntentUrl(text: string) {
  return `https://x.com/intent/tweet?${new URLSearchParams({ text }).toString()}`;
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
    if (!board || previewImageUrl) return;

    let canceled = false;

    requestAnimationFrame(async () => {
      const element = document.getElementById("board-capture");
      if (!element) return;

      await waitForPreviewAssets(element);
      if (canceled) return;

      captureElementAsPngDataUrl(element)
        .then((dataUrl) => {
          if (!canceled) {
            setPreviewImageUrl(dataUrl);
            setPreviewImageError("");
          }
        })
        .catch((error) => {
          console.error("Failed to create preview image", error);
          if (!canceled) {
            setPreviewImageError("이미지 변환이 늦어지고 있어요. 현재 미리보기를 길게 눌러 저장해보세요.");
          }
        });
    });

    return () => {
      canceled = true;
    };
  }, [board, previewImageUrl]);

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
      <div className="mx-auto min-h-screen w-full max-w-[450px] px-6 pb-24 pt-8 sm:px-10">
        <header className="mb-14 flex items-center justify-between">
          <Image
            alt="기온별플리"
            className="h-auto w-[124px]"
            height={38}
            src="/images/gion-logo-transparent.png"
            width={124}
          />
          <button className="text-[13px] font-bold tracking-[0.18em] text-[#8c8b89]" type="button">
            KOR <span className="mx-2 font-normal text-[#c6c2c0]">|</span> ENG
          </button>
        </header>

        {previewImageUrl ? (
          <img
            alt={`${board.title} 미리보기 이미지`}
            className="w-full rounded-[2px]"
            src={previewImageUrl}
          />
        ) : (
          <div className="mx-auto w-full max-w-[370px]">
            <div
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
            {previewImageError ? (
              <p className="mt-3 text-center text-xs font-semibold text-[#8f8986]">
                {previewImageError}
              </p>
            ) : null}
          </div>
        )}

        <div className="relative mt-10">
          {showSaveHint ? (
            <p className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-10 w-fit max-w-[calc(100%-24px)] -translate-x-1/2 rounded-full bg-[rgba(216,211,208,0.86)] px-4 py-2.5 text-center text-xs font-semibold text-[#1c1b1b] opacity-100 shadow-[0_12px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm after:absolute after:left-1/2 after:top-full after:h-0 after:w-0 after:-translate-x-1/2 after:border-x-[7px] after:border-t-[7px] after:border-x-transparent after:border-t-[rgba(216,211,208,0.86)]">
              위 이미지를 길게 눌러 저장하세요.
            </p>
          ) : null}
          <LocalPreviewActions
            artistName={board.artistName}
            boardTitle={board.title}
            captureId="board-capture"
            onSaveHint={() => setShowSaveHint(true)}
            previewImageReady={Boolean(previewImageUrl) || Boolean(previewImageError)}
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
  captureId,
  onSaveHint,
  previewImageReady,
  showSaveHint
}: {
  artistName: string;
  boardTitle: string;
  captureId: string;
  onSaveHint: () => void;
  previewImageReady: boolean;
  showSaveHint: boolean;
}) {
  const [saveError, setSaveError] = useState("");
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

  async function handleShare() {
    const canUseNativeShare = "share" in navigator;

    if (canUseNativeShare) {
      await navigator.share({
        title: boardTitle,
        text: shareCaption
      });
    } else {
      await copyShareCaption();
    }

    await logClientEvent("share", {
      board_id: "local-preview",
      board_slug: "preview",
      channel: canUseNativeShare ? "web_share" : "preview"
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

  async function handleXShare() {
    window.open(buildXIntentUrl(shareCaption), "_blank", "noopener,noreferrer");
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
        onKakaoShare={handleShare}
        onXShare={handleXShare}
      />
    </div>
  );
}
