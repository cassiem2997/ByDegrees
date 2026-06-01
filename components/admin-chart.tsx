import { cn } from "@/lib/utils";

export function AdminChart({
  series,
  metric,
  label
}: {
  series: Array<{ date: string; pageViews: number; creates: number; saves: number; shares: number }>;
  metric: "pageViews" | "creates" | "saves" | "shares";
  label: string;
}) {
  const max = Math.max(...series.map((item) => item[metric]), 1);
  const metricLabel = {
    pageViews: "방문",
    creates: "생성",
    saves: "저장",
    shares: "공유"
  }[metric];

  return (
    <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">기간별 통계</p>
          <p className="text-xs text-ink/50">{label}</p>
        </div>
        <span className="rounded-full bg-ink px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white">
          {metricLabel}
        </span>
      </div>
      <div className="overflow-x-auto pb-1">
        <div
          className="grid h-48 min-w-full items-end gap-2"
          style={{ gridTemplateColumns: `repeat(${series.length}, minmax(18px, 1fr))` }}
        >
          {series.map((item) => {
            const height = Math.max((item[metric] / max) * 100, item[metric] > 0 ? 12 : 4);
            return (
              <div className="flex h-full flex-col justify-end gap-2" key={item.date}>
                <div
                  className={cn(
                    "rounded-t-2xl bg-gradient-to-t",
                    metric === "pageViews" && "from-sky to-[#9bd8ff]",
                    metric === "creates" && "from-lilac to-sky",
                    metric === "saves" && "from-peach to-gold",
                    metric === "shares" && "from-coral to-peach"
                  )}
                  style={{ height: `${height}%` }}
                />
                <div className="text-center text-[10px] text-ink/48">
                  {item.date.slice(5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
