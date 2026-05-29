import { TemperaturePreset } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TemperatureBar({
  presets,
  activePresetId,
  variant = "default"
}: {
  presets: TemperaturePreset[];
  activePresetId?: string;
  variant?: "default" | "editor";
}) {
  if (variant === "editor") {
    return (
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 flex w-3 justify-center">
        <div className="absolute top-0 bottom-0 w-[5px] rounded-full bg-[linear-gradient(180deg,#ff5e5e_0%,#ff985c_15%,#f2d559_30%,#63e68a_50%,#61a9f2_75%,#a17cf0_100%)]" />
        <div className="absolute left-[-1px] top-0 h-4 w-4 rounded-full border border-[#4f4a47] bg-white shadow-sm" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-3 rounded-[22px] border border-white/70 bg-white/65 px-2 py-4 backdrop-blur sm:rounded-[28px] sm:px-3 sm:py-5">
      <div className="relative flex w-full flex-1 justify-center">
        <div className="absolute inset-y-2 w-[5px] rounded-full bg-gradient-to-b from-coral via-gold via-35% to-sky sm:w-[6px]" />
        <div className="relative z-10 flex w-full flex-col justify-between">
          {presets.map((preset) => (
            <div key={preset.id} className="flex items-center gap-2 sm:gap-3">
              <div
                className={cn(
                  "h-3 w-3 rounded-full border-2 border-white shadow-sm transition sm:h-3.5 sm:w-3.5",
                  preset.id === activePresetId ? "bg-ink" : "bg-white/90"
                )}
              />
              <span className="text-[11px] font-semibold text-ink/72 sm:text-xs">{preset.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
