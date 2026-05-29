"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, LoaderCircle, Search, Sparkles, User, Users } from "lucide-react";
import { BoardPreview } from "@/components/board-preview";
import { SearchSongDialog } from "@/components/search-song-dialog";
import { Button } from "@/components/ui/button";
import { getOrCreateSessionId } from "@/lib/session";
import { BoardRow, BoardSummary, MusicArtistResult, MusicTrackResult, TemperaturePreset } from "@/lib/types";

type SelectionTarget = {
  presetId: string;
  slotIndex: number;
} | null;

type CreateStep = "nickname" | "mode" | "artist" | "board";
type ArtistMode = "single" | "multi";
type CreateDraft = {
  nickname: string;
  artistMode: ArtistMode;
  artistName: string;
  artistQuery: string;
  rows: BoardRow[];
};

const PREVIEW_STORAGE_KEY = "temptracks-preview-board";
const CREATE_DRAFT_STORAGE_KEY = "temptracks-create-draft";
const RESTORE_CREATE_STORAGE_KEY = "temptracks-restore-create";

export function CreateBoardClient({
  presets
}: {
  presets: TemperaturePreset[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<CreateStep>("nickname");
  const [nickname, setNickname] = useState("");
  const [artistMode, setArtistMode] = useState<ArtistMode>("single");
  const [artistName, setArtistName] = useState("");
  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState<MusicArtistResult[]>([]);
  const [artistSearchLoading, setArtistSearchLoading] = useState(false);
  const [artistSearchError, setArtistSearchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [selectionTarget, setSelectionTarget] = useState<SelectionTarget>(null);
  const [rows, setRows] = useState<BoardRow[]>(
    presets.map((preset) => ({ preset, songs: [null, null, null] }))
  );
  const displayArtistName = artistMode === "single" ? artistName : "다양한 아티스트";
  const title =
    artistMode === "single"
      ? artistName.trim().length > 0
        ? `기온별 ${artistName.trim()} by ${nickname.trim()}`
        : nickname.trim().length > 0
          ? `기온별 플레이리스트 by ${nickname.trim()}`
          : ""
      : nickname.trim().length > 0
        ? `기온별 플리 by ${nickname.trim()}`
      : "";

  useEffect(() => {
    const shouldRestore = window.sessionStorage.getItem(RESTORE_CREATE_STORAGE_KEY);
    if (!shouldRestore) return;

    const rawDraft = window.sessionStorage.getItem(CREATE_DRAFT_STORAGE_KEY);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft) as CreateDraft;
      setNickname(draft.nickname);
      setArtistMode(draft.artistMode);
      setArtistName(draft.artistName);
      setArtistQuery(draft.artistQuery);
      setRows(draft.rows);
      setStep("board");
    } catch {
      window.sessionStorage.removeItem(CREATE_DRAFT_STORAGE_KEY);
    } finally {
      window.sessionStorage.removeItem(RESTORE_CREATE_STORAGE_KEY);
    }
  }, []);

  function updateSong(
    presetId: string,
    slotIndex: number,
    song: MusicTrackResult | null
  ) {
    setRows((current) =>
      current.map((row) =>
        row.preset.id === presetId
          ? {
              ...row,
              songs: row.songs.map((item, index) =>
                index === slotIndex ? song : item
              )
            }
          : row
      )
    );
  }

  async function handleSongSelect(song: MusicTrackResult) {
    if (!selectionTarget) return;

    updateSong(selectionTarget.presetId, selectionTarget.slotIndex, song);
    setSelectionTarget(null);

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "select_song",
        sessionId: getOrCreateSessionId(),
        metadata: {
          artist: artistName,
          song_title: song.title,
          song_id: song.providerTrackId,
          temperature_preset_id: selectionTarget.presetId
        }
      })
    });
  }

  async function handleArtistSearch() {
    if (!artistQuery.trim()) return;

    setArtistSearchLoading(true);
    setArtistSearchError("");

    try {
      const sessionId = getOrCreateSessionId();
      const response = await fetch(
        `/api/spotify/artists?q=${encodeURIComponent(artistQuery)}&sessionId=${sessionId}`
      );
      const data = (await response.json()) as {
        items: MusicArtistResult[];
        error?: string;
      };

      if (!response.ok) {
        setArtistResults([]);
        setArtistSearchError(data.error ?? "아티스트 검색 중 오류가 발생했습니다.");
        return;
      }

      setArtistResults(data.items ?? []);
    } catch {
      setArtistResults([]);
      setArtistSearchError("네트워크 오류로 아티스트 검색에 실패했습니다.");
    } finally {
      setArtistSearchLoading(false);
    }
  }

  async function handleArtistSelect(artist: MusicArtistResult) {
    setArtistName(artist.name);
    setArtistQuery(artist.name);
    setArtistResults([]);

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "select_artist",
        sessionId: getOrCreateSessionId(),
        metadata: {
          artist: artist.name,
          artist_id: artist.providerArtistId,
          provider: artist.provider
        }
      })
    });

    setStep("board");
  }

  function handleSave() {
    setSaveError("");

    const previewBoard: BoardSummary = {
      id: "local-preview",
      slug: "preview",
      title,
      artistName: artistMode === "single" ? artistName : "Various Artists",
      isPublic: true,
      templateKey: presets[0]?.templateKey ?? "temp-core-v1",
      createdAt: new Date().toISOString(),
      rows
    };
    const draft: CreateDraft = {
      nickname,
      artistMode,
      artistName,
      artistQuery,
      rows
    };

    startTransition(async () => {
      try {
        window.sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(previewBoard));
        window.sessionStorage.setItem(CREATE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
        window.sessionStorage.setItem(RESTORE_CREATE_STORAGE_KEY, "1");
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "create_board",
            sessionId: getOrCreateSessionId(),
            metadata: {
              artist: previewBoard.artistName,
              board_id: previewBoard.id,
              title: previewBoard.title,
              mode: "preview"
            }
          })
        });
        router.push("/preview");
      } catch {
        setSaveError("이미지 미리보기를 준비하지 못했어요. 다시 시도해주세요.");
        return;
      }
    });
  }

  const canSave =
    nickname.trim().length > 0 &&
    (artistMode === "multi" || artistName.trim().length > 0);

  if (step === "nickname") {
    const trimmedNickname = nickname.trim();

    return (
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[450px] flex-col overflow-hidden px-10 text-[#1c1b1b]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_65%,rgba(255,195,113,0.18),transparent_36%),radial-gradient(circle_at_86%_42%,rgba(204,171,216,0.22),transparent_42%)]" />
        <header className="relative z-10 flex justify-end py-7">
          <p className="text-[16px] font-bold tracking-[0.18em] text-[#9d9895]">STEP 01 / 03</p>
        </header>

        <main className="relative z-10 flex flex-1 flex-col justify-center pb-8">
          <div className="relative flex min-h-32 items-center pl-6">
            <div className="absolute left-0 top-0 h-32 w-[4px] rounded-full bg-[linear-gradient(180deg,#ff6b75,#ffc371,#86e3ce,#8a96d7,#ccabd8)] opacity-45" />
            <h1 className="text-[32px] font-medium leading-[1.25] tracking-[-0.08em]">
              이름 또는 닉네임을
              <br />
              적어주세요
            </h1>
          </div>

          <label className="mt-10 block">
            <span className="sr-only">Nickname</span>
            <input
              className="w-full border-0 border-b border-[#d8d3d1] bg-transparent px-0 pb-3 text-[28px] font-medium tracking-[-0.04em] text-[#1c1b1b] outline-none ring-0 placeholder:text-[#c8c2bf] focus:border-[#1c1b1b] focus:ring-0"
              maxLength={12}
              onChange={(event) => setNickname(event.target.value)}
              value={nickname}
            />
          </label>
          <p className="mt-4 text-[15px] font-semibold tracking-[0.08em] text-[#b9b4b1]">
            {nickname.length} / 12
          </p>
        </main>

        <footer className="relative z-10 pb-7">
          <Button
            className="h-16 w-full gap-3 rounded-full bg-[#1a1a1a] text-[22px] font-extrabold tracking-[-0.05em] shadow-[0_24px_42px_rgba(0,0,0,0.16)] disabled:bg-[#a9a8a6] disabled:text-white"
            disabled={trimmedNickname.length === 0}
            onClick={() => setStep("mode")}
          >
            다음 단계로
            <ArrowRight className="h-8 w-8" />
          </Button>
        </footer>
      </div>
    );
  }

  if (step === "mode") {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[450px] flex-col overflow-hidden px-10 text-[#1c1b1b]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(62,58,56,0.12),transparent_54%)]" />
        <header className="relative z-10 flex justify-between py-7">
          <button
            aria-label="이전 단계"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#77716e]"
            onClick={() => setStep("nickname")}
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-[16px] font-bold tracking-[0.18em] text-[#9d9895]">STEP 02 / 03</p>
        </header>

        <main className="relative z-10 flex flex-1 flex-col justify-center pb-8">
          <h1 className="mb-12 text-[31px] font-medium leading-[1.22] tracking-[-0.08em]">
            플레이리스트를
            <br />
            이렇게 구성하고 싶어요
          </h1>

          <div className="space-y-4">
            <ArtistOption
              active={artistMode === "single"}
              icon={<User className="h-5 w-5" />}
            label="모두 같은 아티스트의 곡으로"
              onClick={() => {
                setArtistMode("single");
                setArtistName("");
                setArtistQuery("");
              }}
            />
            <ArtistOption
              active={artistMode === "multi"}
              icon={<Users className="h-5 w-5" />}
              label="다양한 아티스트의 곡으로"
              onClick={() => {
                setArtistMode("multi");
                setArtistName("");
                setArtistQuery("");
              }}
            />
          </div>
        </main>

        <footer className="relative z-10 pb-7">
          <Button
            className="h-16 w-full gap-3 rounded-full bg-[#1a1a1a] text-[22px] font-extrabold tracking-[-0.05em] shadow-[0_24px_42px_rgba(0,0,0,0.16)]"
            onClick={() => setStep(artistMode === "single" ? "artist" : "board")}
          >
            다음 단계로
            <ArrowRight className="h-7 w-7" />
          </Button>
        </footer>
      </div>
    );
  }

  if (step === "artist") {
    return (
      <div className="relative mx-auto flex min-h-screen w-full max-w-[450px] flex-col overflow-hidden px-10 text-[#1c1b1b]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_70%,rgba(255,195,113,0.15),transparent_36%),radial-gradient(circle_at_82%_38%,rgba(138,150,215,0.18),transparent_42%)]" />
        <header className="relative z-10 flex justify-between py-10">
          <button
            aria-label="이전 단계"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#77716e]"
            onClick={() => setStep("mode")}
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-[16px] font-bold tracking-[0.18em] text-[#9d9895]">STEP 03 / 03</p>
        </header>

        <main className="relative z-10 flex flex-1 flex-col justify-center pb-20">
          <div className="relative flex min-h-36 items-center pl-7">
            <div className="absolute left-0 top-0 h-36 w-[4px] rounded-full bg-[linear-gradient(180deg,#ff6b75,#ffc371,#86e3ce,#8a96d7,#ccabd8)] opacity-45" />
            <h1 className="text-[40px] font-medium leading-[1.25] tracking-[-0.08em]">
              아티스트를
              <br />
              선택해주세요
            </h1>
          </div>

          <div className="mt-20 flex items-center border-b border-[#d8d3d1] pb-4">
            <Search className="mr-3 h-5 w-5 shrink-0 text-[#9d9895]" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent px-0 text-[24px] font-medium tracking-[-0.05em] text-[#1c1b1b] outline-none ring-0 placeholder:text-[#c8c2bf] focus:ring-0"
              onChange={(event) => setArtistQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleArtistSearch();
              }}
              placeholder="아티스트명 검색"
              value={artistQuery}
            />
            <Button
              className="ml-3 h-10 shrink-0 px-4 py-0 text-xs"
              disabled={artistSearchLoading || artistQuery.trim().length === 0}
              onClick={handleArtistSearch}
              type="button"
            >
              검색
            </Button>
          </div>

          <div className="mt-8 min-h-[270px] space-y-4">
            {artistSearchLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-[#ebe7e6] bg-white/45 py-12 text-[#77716e]">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                아티스트를 불러오는 중
              </div>
            ) : null}

            {!artistSearchLoading && artistResults.length === 0 && artistSearchError ? (
              <p className="py-6 text-center text-[13px] font-semibold text-[#aaa5a2]">
                {artistSearchError}
              </p>
            ) : null}

            {!artistSearchLoading &&
              artistResults.map((artist) => (
                <button
                  className="flex min-h-[72px] w-full items-center gap-4 text-left transition active:scale-[0.98]"
                  key={artist.providerArtistId}
                  onClick={() => void handleArtistSelect(artist)}
                  type="button"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#ebe7e6]">
                    {artist.imageUrl ? (
                      <img
                        alt={artist.name}
                        className="h-full w-full object-cover"
                        src={artist.imageUrl}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#8c8885]">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-h-[72px] min-w-0 flex-1 items-center border-b border-[#ebe7e6]">
                    <p className="truncate text-[18px] font-extrabold tracking-[-0.04em] text-[#1c1b1b]">
                      {artist.name}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[450px] px-10 pb-36 pt-5 text-[#1c1b1b]">
      <header className="mb-9 flex items-center justify-between">
        <button className="flex h-8 w-[116px] items-center" onClick={() => setStep("mode")} type="button">
          <Image
            alt="기온별플리"
            className="h-auto w-full"
            height={35}
            src="/images/gion-logo-transparent.png"
            width={116}
          />
        </button>
        <button className="text-[11px] font-bold tracking-[0.14em] text-[#8c8b89]" type="button">
          KOR <span className="mx-2 font-normal text-[#c6c2c0]">|</span> ENG
        </button>
      </header>

      <div className="space-y-4">
        <BoardPreview
          artistName={displayArtistName}
          brandText="© 2026 기온별플리 By Degrees. All rights reserved."
          editable
          onAdd={(presetId, slotIndex) => setSelectionTarget({ presetId, slotIndex })}
          onRemove={(presetId, slotIndex) => updateSong(presetId, slotIndex, null)}
          onReplace={(presetId, slotIndex) => setSelectionTarget({ presetId, slotIndex })}
          rows={rows}
          showArtistInput={false}
          showSongArtistName={artistMode !== "single"}
          title={title}
          titlePlaceholder="내 기온별 플레이리스트 제목"
          titleReadOnly
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#fcf8f8] via-[#fcf8f8] to-transparent px-4 pb-8 pt-6">
        <Button
          className="mx-auto flex h-16 w-full max-w-[356px] items-center justify-center gap-3 bg-[#171412] text-[13px] font-bold tracking-[0.12em] text-white shadow-[0_18px_40px_rgba(18,18,18,0.22)] hover:translate-y-0 hover:bg-[#171412]"
          disabled={!canSave || isPending}
          onClick={handleSave}
        >
          {isPending ? "이미지 준비 중..." : "플레이리스트 미리보기"}
          <Sparkles className="h-4 w-4" />
        </Button>
        {saveError ? (
          <p className="mx-auto mt-3 max-w-[356px] text-center text-xs font-medium text-[#ba1a1a]">
            {saveError}
          </p>
        ) : null}
      </div>

      <SearchSongDialog
        artistName={artistMode === "single" ? artistName : ""}
        onClose={() => setSelectionTarget(null)}
        onSelect={handleSongSelect}
        open={selectionTarget !== null}
      />
    </div>
  );
}

function ArtistOption({
  active,
  icon,
  label,
  onClick
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={[
        "flex min-h-[88px] w-full items-center justify-between gap-3 rounded-[20px] border px-4 text-left shadow-[0_12px_28px_rgba(0,0,0,0.05)] transition active:scale-[0.98]",
        active
          ? "border-[#ded9d7] bg-white/78 text-[#1c1b1b]"
          : "border-white/55 bg-white/34 text-[#77716e] opacity-70"
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ebe8e6] text-[#4c4b49]">
          {icon}
        </span>
        <span className="min-w-0 pr-1 text-[17px] font-semibold leading-tight tracking-[-0.06em]">
          {label}
        </span>
      </span>
      {active ? <CheckCircle className="h-6 w-6 shrink-0 fill-[#4c4b49] text-white" /> : null}
    </button>
  );
}
