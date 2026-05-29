import { Plus } from "lucide-react";

export function AddSongCard({
  onClick,
  showLabel = true
}: {
  onClick: () => void;
  showLabel?: boolean;
}) {
  return (
    <button
      className="group flex aspect-square w-full flex-col items-center justify-center rounded-[18px] border border-dashed border-[#d8d2ce] bg-transparent text-[#8f8a88] transition hover:border-[#c9c1bc] hover:bg-white/30 sm:rounded-[20px]"
      onClick={onClick}
      type="button"
    >
      <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.6} />
      {showLabel ? (
        <span className="mt-2 text-[9px] font-medium tracking-[0.14em] text-[#b3adaa] sm:text-[10px]">
          ADD SONG
        </span>
      ) : null}
    </button>
  );
}
