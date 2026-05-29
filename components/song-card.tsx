import Image from "next/image";
import { ExternalLink, X } from "lucide-react";

import { MusicTrackResult } from "@/lib/types";
import { truncate } from "@/lib/utils";

export function SongCard({
  song,
  editable = false,
  onReplace,
  onRemove,
  compact = false,
  showArtistName = true
}: {
  song: MusicTrackResult;
  editable?: boolean;
  onReplace?: () => void;
  onRemove?: () => void;
  compact?: boolean;
  showArtistName?: boolean;
}) {
  if (compact) {
    return (
      <div
        className="group relative w-full text-left"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-[18px] border border-[#ece7e4] bg-[#f1ece8] shadow-[0_4px_14px_rgba(35,31,28,0.05)] transition group-hover:bg-white">
          {song.albumArtUrl ? (
            <Image
              alt={`${song.title} album art`}
              className="h-full w-full object-cover"
              fill
              sizes="120px"
              src={song.albumArtUrl}
            />
          ) : null}
        </div>
        <div className="px-0.5 pt-2 text-center">
          <p className="truncate text-[11.5px] font-bold leading-tight text-ink">
            {song.title}
          </p>
          {showArtistName ? (
            <p className="mt-0.5 truncate text-[9px] font-normal leading-tight text-ink/55">
              {song.artistName}
            </p>
          ) : null}
        </div>
        {editable && onRemove ? (
          <button
            className="absolute right-1.5 top-1.5 z-20 rounded-full bg-white/88 p-1 text-ink/75 shadow-sm"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        ) : null}
        {editable && onReplace ? (
          <button
            aria-label={`${song.title} 교체하기`}
            className="absolute inset-x-0 top-0 z-10 aspect-square"
            onClick={onReplace}
            type="button"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-white/70 bg-white/78 shadow-[0_14px_34px_rgba(32,35,74,0.08)] backdrop-blur sm:rounded-[24px]">
      <div className="relative aspect-square overflow-hidden">
        {song.albumArtUrl ? (
          <Image
            alt={`${song.title} album art`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            fill
            sizes="(max-width: 768px) 33vw, 180px"
            src={song.albumArtUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-peach to-sky text-sm font-semibold text-white">
            No Art
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
        <a
          className="absolute right-2 top-2 rounded-full bg-black/45 p-1.5 text-white backdrop-blur transition hover:bg-black/60 sm:right-3 sm:top-3 sm:p-2"
          href={song.externalUrl}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        {editable && onRemove ? (
          <button
            className="absolute left-2 top-2 rounded-full bg-white/85 p-1.5 text-ink transition hover:bg-white sm:left-3 sm:top-3 sm:p-2"
            onClick={onRemove}
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      <div className="space-y-1 p-2.5 sm:p-3">
        <p className="truncate text-xs font-semibold text-ink sm:text-sm">
          {truncate(song.title, 22)}
        </p>
        <p className="truncate text-[11px] text-ink/60 sm:text-xs">{truncate(song.artistName, 24)}</p>
        {editable && onReplace ? (
          <button
            className="mt-2 rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-medium text-ink/70 transition hover:bg-ink/10 sm:px-3 sm:py-1.5 sm:text-xs"
            onClick={onReplace}
            type="button"
          >
            다른 곡으로 교체
          </button>
        ) : null}
      </div>
    </div>
  );
}
