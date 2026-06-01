import { TemperatureMoodIcons, getTemperatureMoodStyle } from "@/components/temperature-outfit-icons";
import { AddSongCard } from "@/components/add-song-card";
import { SongCard } from "@/components/song-card";
import { BoardSongSlot, TemperaturePreset } from "@/lib/types";
import { cn } from "@/lib/utils";

const TEMPERATURE_EMOJIS = ["🥵", "🌞", "🌼", "🌱", "🍃", "🍁", "❄️", "🥶"];

export function TemperatureRow({
  preset,
  songs,
  editable = false,
  onAdd,
  onReplace,
  onRemove,
  showSongArtistName = true,
  variant = "default"
}: {
  preset: TemperaturePreset;
  songs: BoardSongSlot[];
  editable?: boolean;
  onAdd?: (slotIndex: number) => void;
  onReplace?: (slotIndex: number) => void;
  onRemove?: (slotIndex: number) => void;
  showSongArtistName?: boolean;
  variant?: "default" | "editor";
}) {
  const style = getTemperatureMoodStyle(preset.sortOrder);
  const emoji = TEMPERATURE_EMOJIS[preset.sortOrder - 1];

  if (variant === "editor") {
    return (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className={cn("text-[20px] font-light leading-none tracking-[-0.05em]", style.text)}>
            {preset.label}
          </h3>
          <span aria-hidden="true" className="text-[17px] leading-none">
            {emoji}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {songs.map((song, slotIndex) =>
            song ? (
              <SongCard
                compact
                editable={editable}
                key={`${preset.id}-${slotIndex}-${song.providerTrackId}`}
                onRemove={onRemove ? () => onRemove(slotIndex) : undefined}
                onReplace={onReplace ? () => onReplace(slotIndex) : undefined}
                showArtistName={showSongArtistName}
                song={song}
              />
            ) : editable ? (
              <AddSongCard
                key={`${preset.id}-${slotIndex}-empty`}
                onClick={() => onAdd?.(slotIndex)}
                showLabel={preset.sortOrder === 1 && slotIndex === 0}
              />
            ) : (
              <div
                className="aspect-square w-full rounded-[18px] border border-dashed border-[#dcd6d2] bg-transparent"
                key={`${preset.id}-${slotIndex}-empty`}
              />
            )
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-3 rounded-[22px] border border-white/70 bg-white/65 p-3 backdrop-blur sm:rounded-[28px] sm:p-4 md:grid-cols-[172px_1fr]">
      <div className="flex items-center justify-between gap-3 md:flex-col md:items-start md:justify-center">
        <div
          className={cn(
            "inline-flex w-fit rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold",
            style.badge,
            style.text
          )}
        >
          {style.label}
        </div>
        <TemperatureMoodIcons level={preset.sortOrder} />
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {songs.map((song, slotIndex) =>
          song ? (
            <SongCard
              editable={editable}
              key={`${preset.id}-${slotIndex}-${song.providerTrackId}`}
              onRemove={onRemove ? () => onRemove(slotIndex) : undefined}
              onReplace={onReplace ? () => onReplace(slotIndex) : undefined}
              showArtistName={showSongArtistName}
              song={song}
            />
          ) : (
            editable ? (
              <AddSongCard
                key={`${preset.id}-${slotIndex}-empty`}
                onClick={() => onAdd?.(slotIndex)}
              />
            ) : (
              <div
                className="aspect-square w-full rounded-[24px] border border-dashed border-ink/10 bg-white/40"
                key={`${preset.id}-${slotIndex}-empty`}
              />
            )
          )
        )}
      </div>
    </div>
  );
}
