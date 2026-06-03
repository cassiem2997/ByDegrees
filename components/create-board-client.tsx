"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, LoaderCircle, Search, Sparkles, User, Users } from "lucide-react";
import { BoardPreview } from "@/components/board-preview";
import { SearchSongDialog } from "@/components/search-song-dialog";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOCALE, getCopy, Locale } from "@/lib/i18n/copy";
import { getOrCreateSessionId } from "@/lib/session";
import { BoardRow, BoardSummary, MusicArtistResult, MusicTrackResult, TemperaturePreset } from "@/lib/types";
import { cn } from "@/lib/utils";

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
const STEP_TEXT_CLASS = "text-[13px] font-medium tracking-[0.18em] text-[#9d9895]";
const STEP_BACK_BUTTON_CLASS = "-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-[#77716e]";

function StepTitle({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex min-h-[76px] items-center pl-6", className)}>
      <div className="absolute bottom-0 left-0 top-0 w-[4px] rounded-full bg-[linear-gradient(180deg,#ff6b75,#ffc371,#86e3ce,#8a96d7,#ccabd8)] opacity-45" />
      <h1 className="text-[29px] font-medium leading-[1.22] tracking-[-0.08em]">
        {children}
      </h1>
    </div>
  );
}

export function CreateBoardClient({
  locale = DEFAULT_LOCALE,
  presets
}: {
  locale?: Locale;
  presets: TemperaturePreset[];
}) {
  const router = useRouter();
  const t = getCopy(locale);
  const landingHref = locale === "en" ? "/en" : "/";
  const previewHref = locale === "en" ? "/en/preview" : "/preview";
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
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showSpotifyRateLimitNotice, setShowSpotifyRateLimitNotice] = useState(false);
  const [pendingDuplicateSong, setPendingDuplicateSong] = useState<MusicTrackResult | null>(null);
  const [selectionTarget, setSelectionTarget] = useState<SelectionTarget>(null);
  const [rows, setRows] = useState<BoardRow[]>(
    presets.map((preset) => ({ preset, songs: [null, null, null] }))
  );
  const displayArtistName = artistMode === "single" ? artistName : t.create.multiArtistName;
  const title =
    artistMode === "single"
      ? artistName.trim().length > 0
        ? t.create.singleBoardTitle
            .replace("{artistName}", artistName.trim())
            .replace("{nickname}", nickname.trim())
        : nickname.trim().length > 0
          ? t.create.boardTitleFallback.replace("{nickname}", nickname.trim())
          : ""
      : nickname.trim().length > 0
        ? t.create.multiBoardTitle.replace("{nickname}", nickname.trim())
      : "";
  const emptyRowCount = rows.filter((row) => row.songs.every((song) => !song)).length;

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

  useEffect(() => {
    if (!showSaveToast) return;

    const timeout = window.setTimeout(() => {
      setShowSaveToast(false);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [showSaveToast]);

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

  async function addSongToSelection(song: MusicTrackResult) {
    if (!selectionTarget) return;

    updateSong(selectionTarget.presetId, selectionTarget.slotIndex, song);
    setSelectionTarget(null);
    setPendingDuplicateSong(null);

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

  async function handleSongSelect(song: MusicTrackResult) {
    const isDuplicate = rows.some((row) =>
      row.songs.some((item) => item?.providerTrackId === song.providerTrackId)
    );

    if (isDuplicate) {
      setPendingDuplicateSong(song);
      return;
    }

    await addSongToSelection(song);
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
        if (response.status === 429) {
          setShowSpotifyRateLimitNotice(true);
        }
        setArtistSearchError(locale === "ko" ? data.error ?? t.create.artistSearchError : t.create.artistSearchError);
        return;
      }

      setArtistResults(data.items ?? []);
    } catch {
      setArtistResults([]);
      setArtistSearchError(t.create.artistNetworkError);
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

    if (emptyRowCount > 0) {
      setShowSaveToast(true);
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: getOrCreateSessionId(),
            title: previewBoard.title,
            artistName: previewBoard.artistName,
            isPublic: previewBoard.isPublic,
            templateKey: previewBoard.templateKey,
            rows: previewBoard.rows.map((row) => ({
              temperaturePresetId: row.preset.id,
              songs: row.songs
            }))
          })
        });

        const data = (await response.json()) as {
          id?: string;
          slug?: string;
          error?: string;
        };

        if (!response.ok || !data.id || !data.slug) {
          setSaveError(locale === "ko" ? data.error ?? t.create.previewFailed : t.create.previewFailed);
          return;
        }

        window.sessionStorage.setItem(
          PREVIEW_STORAGE_KEY,
          JSON.stringify({
            ...previewBoard,
            id: data.id,
            slug: data.slug
          })
        );
        window.sessionStorage.setItem(CREATE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
        window.sessionStorage.setItem(RESTORE_CREATE_STORAGE_KEY, "1");
        router.push(previewHref);
      } catch {
        setSaveError(t.create.imagePreviewFailed);
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
        <header className="relative z-10 flex h-[92px] items-center justify-between">
          <button
            aria-label={t.create.backToLanding}
            className={STEP_BACK_BUTTON_CLASS}
            onClick={() => router.push(landingHref)}
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className={STEP_TEXT_CLASS}>STEP 01 / 03</p>
        </header>

        <main className="relative z-10 flex flex-1 flex-col pt-20 pb-8">
          <StepTitle>
            {renderTitleLines(t.create.nicknameTitle)}
          </StepTitle>

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
            {t.create.next}
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
        <header className="relative z-10 flex h-[92px] items-center justify-between">
          <button
            aria-label={t.create.previous}
            className={STEP_BACK_BUTTON_CLASS}
            onClick={() => setStep("nickname")}
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className={STEP_TEXT_CLASS}>STEP 02 / 03</p>
        </header>

        <main className="relative z-10 flex flex-1 flex-col pt-20 pb-8">
          <StepTitle className="mb-12">
            {renderTitleLines(t.create.modeTitle)}
          </StepTitle>

          <div className="space-y-4">
            <ArtistOption
              active={artistMode === "single"}
              icon={<User className="h-5 w-5" />}
              label={t.create.singleArtistMode}
              labelClassName="-translate-x-[4pt]"
              onClick={() => {
                setArtistMode("single");
                setArtistName("");
                setArtistQuery("");
              }}
            />
            <ArtistOption
              active={artistMode === "multi"}
              icon={<Users className="h-5 w-5" />}
              label={t.create.multiArtistMode}
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
            className="h-16 w-full gap-3 rounded-full bg-[#1a1a1a] text-[22px] font-extrabold tracking-[-0.05em] shadow-[0_24px_42px_rgba(0,0,0,0.16)] hover:translate-y-0 hover:bg-[#1a1a1a]"
            onClick={() => setStep(artistMode === "single" ? "artist" : "board")}
          >
            {t.create.next}
            <ArrowRight className="h-8 w-8" />
          </Button>
        </footer>
      </div>
    );
  }

  if (step === "artist") {
    return (
      <div className="relative mx-auto flex min-h-screen w-full max-w-[450px] flex-col overflow-hidden px-10 text-[#1c1b1b]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_70%,rgba(255,195,113,0.15),transparent_36%),radial-gradient(circle_at_82%_38%,rgba(138,150,215,0.18),transparent_42%)]" />
        <header className="relative z-10 flex h-[92px] items-center justify-between">
          <button
            aria-label={t.create.previous}
            className={STEP_BACK_BUTTON_CLASS}
            onClick={() => setStep("mode")}
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className={STEP_TEXT_CLASS}>STEP 03 / 03</p>
        </header>

        <main className="relative z-10 flex flex-1 flex-col pt-20 pb-20">
          <StepTitle>
            {renderTitleLines(t.create.artistTitle)}
          </StepTitle>

          <div className="mt-16 flex items-center border-b border-[#d8d3d1] pb-3">
            <Search className="mr-2.5 h-4 w-4 shrink-0 text-[#9d9895]" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent px-0 text-[19px] font-medium tracking-[-0.05em] text-[#1c1b1b] outline-none ring-0 placeholder:text-[#c8c2bf] focus:ring-0"
              onChange={(event) => setArtistQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleArtistSearch();
              }}
              placeholder={t.create.artistSearchPlaceholder}
              value={artistQuery}
            />
            <Button
              className="ml-2.5 h-8 shrink-0 px-3 py-0 text-[10px]"
              disabled={artistSearchLoading || artistQuery.trim().length === 0}
              onClick={handleArtistSearch}
              type="button"
            >
              {t.common.search}
            </Button>
          </div>

          <div className="mt-8 max-h-[270px] min-h-[270px] space-y-4 overflow-y-auto pr-2 [scrollbar-color:#c8c2bf_transparent] [scrollbar-width:thin]">
            {artistSearchLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-[#ebe7e6] bg-white/45 py-12 text-[#77716e]">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                {t.create.artistLoading}
              </div>
            ) : null}

            {!artistSearchLoading && artistResults.length === 0 && artistSearchError ? (
              <p className="whitespace-pre-line py-6 text-center text-[13px] font-semibold text-[#aaa5a2]">
                {artistSearchError}
              </p>
            ) : null}

            {!artistSearchLoading &&
              artistResults.map((artist) => (
                <button
                  className="flex min-h-[50px] w-full items-center gap-3 text-left transition active:scale-[0.98]"
                  key={artist.providerArtistId}
                  onClick={() => void handleArtistSelect(artist)}
                  type="button"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#ebe7e6]">
                    {artist.imageUrl ? (
                      <img
                        alt={artist.name}
                        className="h-full w-full object-cover"
                        src={artist.imageUrl}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#8c8885]">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-h-[50px] min-w-0 flex-1 items-center border-b border-[#ebe7e6]">
                    <p className="truncate text-[13px] font-extrabold tracking-[-0.04em] text-[#1c1b1b]">
                      {artist.name}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </main>
        {showSpotifyRateLimitNotice ? <SpotifyRateLimitNotice locale={locale} /> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[450px] px-10 pb-36 pt-5 text-[#1c1b1b]">
      <header className="mb-7 flex items-center justify-center border-b border-[#e6dfdc] pb-5">
        <button className="flex h-8 w-[116px] items-center" onClick={() => setStep("mode")} type="button">
          <Image
            alt={t.common.appName}
            className="h-auto w-full"
            height={35}
            src="/images/gion-logo-transparent.png"
            width={116}
          />
        </button>
      </header>

      <div className="space-y-4 pt-2">
        <BoardPreview
          artistName={displayArtistName}
          brandText={t.boardPreview.brandText}
          editable
          onAdd={(presetId, slotIndex) => setSelectionTarget({ presetId, slotIndex })}
          onRemove={(presetId, slotIndex) => updateSong(presetId, slotIndex, null)}
          onReplace={(presetId, slotIndex) => setSelectionTarget({ presetId, slotIndex })}
          rows={rows}
          showArtistInput={false}
          showSongArtistName={artistMode !== "single"}
          title={title}
          titlePlaceholder={t.create.titlePlaceholder}
          titleReadOnly
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#fcf8f8] via-[#fcf8f8] to-transparent px-4 pb-8 pt-6">
        {showSaveToast ? (
          <div className="pointer-events-none fixed left-1/2 top-1/2 z-50 w-[min(338px,calc(100%-48px))] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-[rgba(216,211,208,0.92)] px-6 py-4 text-center text-[18px] font-bold leading-[1.45] tracking-[-0.03em] text-[#1c1b1b] shadow-[0_18px_34px_rgba(0,0,0,0.16)] backdrop-blur-sm">
            <span aria-hidden="true" className="mx-auto mb-2 block text-[24px] leading-none">
              ⚠️
            </span>
            <p>
              {renderToastLines(t.create.missingSongs)}
            </p>
          </div>
        ) : null}
        <Button
          className="mx-auto flex h-16 w-full max-w-[356px] items-center justify-center gap-3 bg-[#171412] text-[15px] font-bold tracking-[-0.03em] text-white shadow-[0_18px_40px_rgba(18,18,18,0.22)] hover:translate-y-0 hover:bg-[#171412]"
          disabled={!canSave || isPending}
          onClick={handleSave}
        >
          {isPending ? t.create.preparingImage : t.create.preview}
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
        duplicateSong={pendingDuplicateSong}
        locale={locale}
        onConfirmDuplicate={() => {
          if (pendingDuplicateSong) void addSongToSelection(pendingDuplicateSong);
        }}
        onClose={() => setSelectionTarget(null)}
        onDuplicateCancel={() => setPendingDuplicateSong(null)}
        onRateLimit={() => setShowSpotifyRateLimitNotice(true)}
        onSelect={handleSongSelect}
        open={selectionTarget !== null}
      />
      {showSpotifyRateLimitNotice ? <SpotifyRateLimitNotice locale={locale} /> : null}
    </div>
  );
}

function renderTitleLines(text: string) {
  return text.split("\n").map((line, index) => (
    <span className={index > 0 ? "whitespace-nowrap" : undefined} key={`${line}-${index}`}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}

function renderToastLines(text: string) {
  return text.split("\n").map((line, index) => (
    <span className={index === 0 ? "whitespace-nowrap" : undefined} key={`${line}-${index}`}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}

function SpotifyRateLimitNotice({
  locale = DEFAULT_LOCALE
}: {
  locale?: Locale;
}) {
  const t = getCopy(locale);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#fcf8f7]/58 px-8 backdrop-blur-[2px]">
      <section className="w-full max-w-[350px] rounded-[28px] border border-[#e1dbd8] bg-[#fcf8f7]/95 px-7 py-7 text-center shadow-[0_24px_60px_rgba(28,27,27,0.16)]">
        <p className="text-[34px] leading-none" aria-hidden="true">
          🚧
        </p>
        <h1 className="mt-4 text-[24px] font-extrabold tracking-[-0.06em] text-[#1c1b1b]">
          {t.create.maintenanceTitle}
        </h1>
        <p className="mt-4 text-[15px] font-semibold leading-[1.55] tracking-[-0.04em] text-[#5f5e5e]">
          {renderTitleLines(t.create.maintenanceDescription)}
        </p>
      </section>
    </div>
  );
}

function ArtistOption({
  active,
  icon,
  label,
  labelClassName,
  onClick
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  labelClassName?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={[
        "flex min-h-[88px] w-full items-center gap-3 rounded-[20px] border px-4 text-left shadow-[0_12px_28px_rgba(0,0,0,0.05)] transition active:scale-[0.98]",
        active
          ? "border-[#ded9d7] bg-white/78 text-[#1c1b1b]"
          : "border-white/55 bg-white/34 text-[#77716e] opacity-70"
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <span className="grid min-w-0 flex-1 grid-cols-[40px_1fr] items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ebe8e6] text-[#4c4b49]">
          {active ? <CheckCircle className="h-5 w-5 fill-[#4c4b49] text-white" /> : (
            <span className="flex h-5 w-5 items-center justify-center">
              {icon}
            </span>
          )}
        </span>
        <span
          className={cn(
            "min-w-0 whitespace-nowrap text-[16px] font-semibold leading-tight tracking-[-0.06em]",
            labelClassName
          )}
        >
          {label}
        </span>
      </span>
    </button>
  );
}
