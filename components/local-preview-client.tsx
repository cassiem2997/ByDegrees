"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Download, Link2 } from "lucide-react";

import { BoardPreview } from "@/components/board-preview";
import { Button } from "@/components/ui/button";
import { generateBoardPreviewDataUrl } from "@/lib/preview-canvas";
import { getOrCreateSessionId } from "@/lib/session";
import { BoardSummary } from "@/lib/types";

const PREVIEW_STORAGE_KEY = "temptracks-preview-board";
const CREATE_DRAFT_STORAGE_KEY = "temptracks-create-draft";
const RESTORE_CREATE_STORAGE_KEY = "temptracks-restore-create";
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

function buildXShareText(boardTitle: string, artistName?: string) {
  const caption = buildShareCaption(boardTitle, artistName);

  return caption.replace(boardTitle, `[${boardTitle}]`).replace(
    "\n",
    "\n음악으로 기록하는 여러분의 계절도 공유해주세요 🎧\n"
  );
}

function getAppShareUrl(path = "") {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
  return `${baseUrl.replace(/\/$/, "")}${path}`;
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
  const [showLinkCopiedToast, setShowLinkCopiedToast] = useState(false);
  const saveLongPressTimeoutRef = useRef<number | null>(null);
  const saveLongPressLoggedRef = useRef(false);

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

  useEffect(() => {
    if (!showLinkCopiedToast) return;

    const timeout = window.setTimeout(() => {
      setShowLinkCopiedToast(false);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [showLinkCopiedToast]);

  useEffect(() => {
    saveLongPressLoggedRef.current = false;
  }, [board?.id]);

  function clearSaveLongPressTimeout() {
    if (saveLongPressTimeoutRef.current === null) return;
    window.clearTimeout(saveLongPressTimeoutRef.current);
    saveLongPressTimeoutRef.current = null;
  }

  async function logSaveLongPress(trigger: "long_press" | "context_menu") {
    if (!board || saveLongPressLoggedRef.current) return;

    saveLongPressLoggedRef.current = true;
    await logClientEvent("save_image_long_press", {
      board_id: board.id,
      board_slug: board.slug,
      board_title: board.title,
      trigger
    });
  }

  function handlePreviewImagePointerDown() {
    clearSaveLongPressTimeout();
    saveLongPressTimeoutRef.current = window.setTimeout(() => {
      void logSaveLongPress("long_press");
    }, 650);
  }

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
        <header className="mb-7 flex items-center justify-center px-6">
          <Image
            alt="기온별플리"
            className="h-auto w-[124px]"
            height={38}
            priority
            src="/images/gion-logo-transparent.png"
            width={124}
          />
        </header>

        {previewImageUrl ? (
          <img
            alt={`${board.title} 미리보기 이미지`}
            className="mx-auto w-full max-w-[370px] rounded-[2px]"
            onContextMenu={() => void logSaveLongPress("context_menu")}
            onPointerCancel={clearSaveLongPressTimeout}
            onPointerDown={handlePreviewImagePointerDown}
            onPointerLeave={clearSaveLongPressTimeout}
            onPointerUp={clearSaveLongPressTimeout}
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
            <p className="pointer-events-none absolute bottom-[calc(100%-4px)] left-[calc(16.666667%+1rem)] z-10 w-fit max-w-[calc(100%-24px)] -translate-x-1/2 rounded-full bg-[rgba(216,211,208,0.86)] px-5 py-3 text-center text-[14px] font-semibold leading-[1.35] text-[#1c1b1b] opacity-100 shadow-[0_14px_28px_rgba(0,0,0,0.13)] backdrop-blur-sm after:absolute after:left-1/2 after:top-full after:h-0 after:w-0 after:-translate-x-1/2 after:border-x-[14px] after:border-t-[14px] after:border-x-transparent after:border-t-[rgba(216,211,208,0.86)]">
              위 이미지를 길게 👆
              <br />
              눌러 저장해주세요.
            </p>
          ) : null}
          {showLinkCopiedToast ? (
            <p className="pointer-events-none absolute bottom-[calc(100%-4px)] left-[calc(83.333333%-1rem)] z-10 w-fit max-w-[calc(100%-24px)] -translate-x-1/2 rounded-full bg-[rgba(216,211,208,0.9)] px-5 py-3 text-center text-[14px] font-semibold leading-[1.35] text-[#1c1b1b] shadow-[0_14px_28px_rgba(0,0,0,0.13)] backdrop-blur-sm after:absolute after:left-1/2 after:top-full after:h-0 after:w-0 after:-translate-x-1/2 after:border-x-[14px] after:border-t-[14px] after:border-x-transparent after:border-t-[rgba(216,211,208,0.9)]">
              링크가 복사되었습니다.
            </p>
          ) : null}
          <LocalPreviewActions
            artistName={board.artistName}
            boardId={board.id}
            boardSlug={board.slug}
            boardTitle={board.title}
            onLinkCopied={() => setShowLinkCopiedToast(true)}
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
  boardId,
  boardSlug,
  boardTitle,
  onLinkCopied,
  onSaveHint,
  previewImageReady,
  showSaveHint
}: {
  artistName: string;
  boardId: string;
  boardSlug: string;
  boardTitle: string;
  onLinkCopied: () => void;
  onSaveHint: () => void;
  previewImageReady: boolean;
  showSaveHint: boolean;
}) {
  const [saveError, setSaveError] = useState("");
  const shareUrl = boardSlug === "preview" ? getAppShareUrl() : getAppShareUrl(`/boards/${boardSlug}`);

  async function handleDownload() {
    if (!previewImageReady) {
      setSaveError("이미지 미리보기를 준비 중이에요. 잠시 후 다시 눌러주세요.");
      return;
    }

    setSaveError("");
    onSaveHint();

    await logClientEvent("save_image", {
      board_id: boardId,
      board_slug: boardSlug,
      board_title: boardTitle
    });
  }

  async function handleCopyLink() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(shareUrl);
    onLinkCopied();

    await logClientEvent("share", {
      board_id: boardId,
      board_slug: boardSlug,
      channel: "copy_link"
    });
  }

  async function handleXShare() {
    window.open(
      buildXIntentUrl(buildXShareText(boardTitle, artistName)),
      "_blank",
      "noopener,noreferrer"
    );
    await logClientEvent("share", {
      board_id: boardId,
      board_slug: boardSlug,
      channel: "x_intent"
    });
  }

  function handleCreateNew() {
    window.sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
    window.sessionStorage.removeItem(CREATE_DRAFT_STORAGE_KEY);
    window.sessionStorage.removeItem(RESTORE_CREATE_STORAGE_KEY);
    window.location.assign("/create");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        <Button
          className="h-[52px] gap-1 rounded-full bg-[#1a1a1a] px-1.5 text-[12px] font-bold tracking-[-0.04em] text-white shadow-[0_14px_24px_rgba(0,0,0,0.13)] hover:translate-y-0 hover:bg-[#1a1a1a]"
          onClick={handleDownload}
          type="button"
        >
          <Download className="h-4 w-4" />
          저장
        </Button>
        <Button
          className="h-[52px] gap-1.5 rounded-full bg-[#1a1a1a] px-2 text-[13px] font-bold tracking-[-0.03em] text-white shadow-[0_14px_24px_rgba(0,0,0,0.13)] hover:translate-y-0 hover:bg-[#1a1a1a]"
          onClick={handleXShare}
          type="button"
        >
          <span aria-hidden="true" className="text-[17px] leading-none">
            X
          </span>
          X로 공유
        </Button>
        <Button
          className="h-[52px] gap-1 rounded-full bg-[#1a1a1a] px-1.5 text-[12px] font-bold tracking-[-0.04em] text-white shadow-[0_14px_24px_rgba(0,0,0,0.13)] hover:translate-y-0 hover:bg-[#1a1a1a]"
          onClick={handleCopyLink}
          type="button"
        >
          <Link2 className="h-4 w-4" />
          링크 공유
        </Button>
      </div>
      <Button
        className="h-14 w-full rounded-full border border-[#d8d2ce] bg-transparent text-[14px] font-bold tracking-[-0.03em] text-[#4f4a47] shadow-none hover:translate-y-0 hover:bg-white/45"
        onClick={handleCreateNew}
        type="button"
        variant="secondary"
      >
        새로 만들기
      </Button>
      {saveError ? (
        <p className="text-center text-xs font-medium text-[#ba1a1a]">{saveError}</p>
      ) : null}
    </div>
  );
}
