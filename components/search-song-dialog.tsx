"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LoaderCircle, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MusicTrackResult } from "@/lib/types";
import { getOrCreateSessionId } from "@/lib/session";

export function SearchSongDialog({
  open,
  artistName,
  onClose,
  onSelect
}: {
  open: boolean;
  artistName?: string;
  onClose: () => void;
  onSelect: (song: MusicTrackResult) => void;
}) {
  const [query, setQuery] = useState(artistName ?? "");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MusicTrackResult[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (open) {
      setQuery(artistName ?? "");
      setResults([]);
      setErrorMessage("");
    }
  }, [artistName, open]);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const sessionId = getOrCreateSessionId();
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&sessionId=${sessionId}`);
      const data = (await res.json()) as { items: MusicTrackResult[]; error?: string };

      if (!res.ok) {
        setResults([]);
        setErrorMessage(data.error ?? "곡 검색 중 오류가 발생했습니다.");
        return;
      }

      setResults(data.items ?? []);
    } catch {
      setResults([]);
      setErrorMessage("네트워크 오류로 곡 검색에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <section
        className="absolute bottom-0 left-1/2 flex h-[85dvh] w-full max-w-[450px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[32px] bg-[#fcf8f7] shadow-[0_-24px_60px_rgba(0,0,0,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center py-4">
          <div className="h-1.5 w-12 rounded-full bg-[#d8d3d1]" />
        </div>

        <header className="flex items-start justify-between px-10 pb-6">
          <div>
            <h2 className="text-[24px] font-extrabold tracking-[-0.06em] text-[#1c1b1b]">
              곡 선택하기
            </h2>
            <p className="mt-2 text-[13px] font-semibold tracking-[0.12em] text-[#aaa5a2]">
              ADD TRACK TO PLAYLIST
            </p>
          </div>
          <button
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#77716e]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="px-10">
          <div className="flex items-center rounded-full bg-[#f1edec] px-5 py-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)]">
            <Search className="mr-3 h-5 w-5 text-[#aaa5a2]" />
            <Input
              className="h-10 rounded-none border-0 bg-transparent px-0 py-0 text-[14px] text-[#1c1b1b] shadow-none placeholder:text-[#aaa5a2] focus:border-0"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleSearch();
              }}
              placeholder="곡명 또는 아티스트명으로 검색"
              value={query}
            />
            <Button className="ml-3 h-9 shrink-0 px-4 py-0 text-xs" onClick={handleSearch} type="button">
              검색
            </Button>
          </div>
        </div>

        <div className="mt-8 flex-1 space-y-5 overflow-y-auto px-10 pb-24">
          {loading ? (
            <div className="flex items-center justify-center rounded-xl border border-[#ece7e4] bg-white/45 px-4 py-10 text-[#77716e]">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              곡을 불러오는 중
            </div>
          ) : null}

          {!loading && results.length === 0 && errorMessage ? (
            <p className="py-6 text-center text-[13px] font-semibold text-[#aaa5a2]">
              {errorMessage}
            </p>
          ) : null}

          {!loading &&
            results.map((song) => (
              <button
                className="flex w-full items-center gap-4 text-left transition active:scale-[0.98]"
                key={song.providerTrackId}
                onClick={() => onSelect(song)}
                type="button"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#ebe7e6]">
                  {song.albumArtUrl ? (
                    <Image
                      alt={song.title}
                      className="object-cover"
                      fill
                      sizes="56px"
                      src={song.albumArtUrl}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 border-b border-[#ebe7e6] pb-4">
                  <p className="truncate text-[16px] font-extrabold tracking-[-0.04em] text-[#1c1b1b]">
                    {song.title}
                  </p>
                  <p className="truncate text-[14px] font-medium text-[#5f5e5e]">{song.artistName}</p>
                </div>
              </button>
            ))}
        </div>

        <footer className="absolute bottom-0 w-full bg-[#fcf8f7] px-10 py-5 text-center">
          <p className="text-[12px] italic text-[#aaa5a2]">Spotify 검색 결과를 불러옵니다</p>
        </footer>
      </section>
    </div>
  );
}
