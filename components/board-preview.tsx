import { Input } from "@/components/ui/input";
import { BoardRow, BoardSongSlot, TemperaturePreset } from "@/lib/types";
import { cn } from "@/lib/utils";

import { TemperatureBar } from "@/components/temperature-bar";
import { TemperatureRow } from "@/components/temperature-row";
import { getTemperatureMoodStyle } from "@/components/temperature-outfit-icons";

const TEMPERATURE_EMOJIS = ["🥵", "🌞", "🌼", "🌱", "🍁", "🍂", "❄️", "🥶"];

function getPreviewSongTitleClass(title: string) {
  if (title.length <= 8) return "text-[10px]";
  if (title.length <= 14) return "text-[8.5px]";
  return "text-[7px]";
}

function compactPreviewSongs(songs: BoardSongSlot[]) {
  const filledSongs = songs.filter((song): song is NonNullable<BoardSongSlot> => Boolean(song));
  return [filledSongs[0] ?? null, filledSongs[1] ?? null, filledSongs[2] ?? null];
}

function getPreviewTitleClass(title: string) {
  if (title.length <= 18) return "text-[22px]";
  if (title.length <= 26) return "text-[19px]";
  return "text-[16px]";
}

function StyledPreviewTitle({ title }: { title: string }) {
  const displayTitle = title || "기온별 플리";
  const [mainTitle, nickname] = displayTitle.split(" by ");

  return (
    <h2
      className={cn(
        "truncate text-center leading-tight tracking-[-0.06em]",
        getPreviewTitleClass(displayTitle)
      )}
      title={displayTitle}
    >
      <span className="font-extrabold text-[#1c1b1b]">{mainTitle}</span>
      {nickname ? (
        <span className="text-[70%] font-medium text-[#4f4a47]"> by {nickname}</span>
      ) : null}
    </h2>
  );
}

export function BoardPreview({
  title,
  artistName,
  rows,
  editable = false,
  onAdd,
  onReplace,
  onRemove,
  onTitleChange,
  onArtistNameChange,
  titlePlaceholder = "기온별 플레이리스트",
  artistInputPlaceholder = "아티스트명 입력",
  brandText = "© 2026 기온별플리 (By Degrees)",
  titleReadOnly = false,
  showArtistInput = true,
  showSongArtistName = true
}: {
  title: string;
  artistName: string;
  rows: BoardRow[];
  editable?: boolean;
  onAdd?: (presetId: string, slotIndex: number) => void;
  onReplace?: (presetId: string, slotIndex: number) => void;
  onRemove?: (presetId: string, slotIndex: number) => void;
  onTitleChange?: (value: string) => void;
  onArtistNameChange?: (value: string) => void;
  titlePlaceholder?: string;
  artistInputPlaceholder?: string;
  brandText?: string;
  titleReadOnly?: boolean;
  showArtistInput?: boolean;
  showSongArtistName?: boolean;
}) {
  const presets: TemperaturePreset[] = rows.map((row) => row.preset);

  if (editable) {
    return (
      <section className="w-full">
        <div className="space-y-4">
          <Input
            className="h-auto rounded-none border-0 bg-transparent px-0 py-1 text-center text-[21px] font-semibold tracking-[-0.05em] text-[#1c1b1b] shadow-none placeholder:text-[#1c1b1b] focus:border-0 focus:ring-0"
            onChange={(event) => onTitleChange?.(event.target.value)}
            placeholder={titlePlaceholder}
            readOnly={titleReadOnly}
            value={title}
          />
          {showArtistInput ? (
            <Input
              className="h-[43px] rounded-none border border-[#d7d1cf] bg-transparent px-3 py-2 text-[13px] font-medium text-[#1c1b1b] placeholder:text-[#9e9996] focus:border-[#1c1b1b]"
              onChange={(event) => onArtistNameChange?.(event.target.value)}
              placeholder={artistInputPlaceholder}
              value={artistName}
            />
          ) : null}
        </div>

        <div className="relative mt-8 pl-8">
          <TemperatureBar presets={presets} variant="editor" />
          <div className="space-y-8">
            {rows.map((row) => (
              <TemperatureRow
                editable
                key={row.preset.id}
                onAdd={onAdd ? (slotIndex) => onAdd(row.preset.id, slotIndex) : undefined}
                onRemove={onRemove ? (slotIndex) => onRemove(row.preset.id, slotIndex) : undefined}
                onReplace={onReplace ? (slotIndex) => onReplace(row.preset.id, slotIndex) : undefined}
                preset={row.preset}
                showSongArtistName={showSongArtistName}
                songs={row.songs}
                variant="editor"
              />
            ))}
          </div>
        </div>

        <div className="pb-8 pt-16 text-center text-[10px] tracking-[0.02em] text-[#c6bfbb]">
          {brandText}
        </div>
      </section>
    );
  }

  return (
    <section className="flex aspect-[9/16] w-full flex-col overflow-hidden bg-[#fcf8f7] px-4 pb-1 pt-3">
      <div className="mx-auto mb-[6px] w-[292px]">
        <StyledPreviewTitle title={title} />
      </div>

      <div className="mx-auto grid w-[292px] grid-cols-[5px_44px_227px] gap-x-2">
        <div className="relative flex justify-center">
          <div className="h-full w-[5px] rounded-full bg-[linear-gradient(180deg,#ff5e5e_0%,#ff985c_15%,#f2d559_30%,#63e68a_50%,#61a9f2_75%,#a17cf0_100%)]" />
          <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full border border-[#4f4a47] bg-white shadow-sm" />
        </div>
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div
              className={cn(
                "flex h-[68px] flex-col items-end pt-0.5 text-right text-[11.5px] font-[350] leading-none tracking-[-0.05em]",
                getTemperatureMoodStyle(row.preset.sortOrder).text
              )}
              key={`${row.preset.id}-label`}
            >
              <span>{row.preset.label}</span>
              <span aria-hidden="true" className="mt-0.5 text-[13px] leading-none">
                {TEMPERATURE_EMOJIS[row.preset.sortOrder - 1]}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div className="grid grid-cols-[repeat(3,68px)] gap-[8.5px]" key={row.preset.id}>
              {compactPreviewSongs(row.songs).map((song, index) => (
                <div
                  className={[
                    "relative aspect-square overflow-hidden rounded-md",
                    song
                      ? "bg-white shadow-[0_8px_18px_rgba(0,0,0,0.04)]"
                      : "bg-white/28 shadow-[inset_0_0_14px_rgba(255,255,255,0.4)]"
                  ].join(" ")}
                  key={`${row.preset.id}-${index}-${song?.providerTrackId ?? "empty"}`}
                >
                  {song?.albumArtUrl ? (
                    <>
                      <img
                        alt={`${song.title} album art`}
                        className="h-full w-full object-cover"
                        src={song.albumArtUrl}
                      />
                      <div className="absolute inset-x-0 bottom-0 px-0.5 py-1">
                        <p
                          className={[
                            "truncate text-center font-bold leading-tight text-white",
                            getPreviewSongTitleClass(song.title)
                          ].join(" ")}
                          style={{
                            WebkitTextStroke: "0.45px rgba(0,0,0,0.95)",
                            textShadow:
                              "-1px -1px 0 rgba(0,0,0,0.9), 0 -1px 0 rgba(0,0,0,0.9), 1px -1px 0 rgba(0,0,0,0.9), -1px 0 0 rgba(0,0,0,0.9), 1px 0 0 rgba(0,0,0,0.9), -1px 1px 0 rgba(0,0,0,0.9), 0 1px 0 rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,0.9)"
                          }}
                        >
                          {song.title}
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-auto text-center text-[5pt] font-semibold tracking-[0.03em] text-[#b7b2af]">
        © 2026 기온별플리 By Degrees. All rights reserved.
      </p>
    </section>
  );
}
