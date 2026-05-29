import { ReactNode } from "react";

export function AdminStatsCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 shadow-[0_18px_48px_rgba(27,30,70,0.08)] backdrop-blur">
      <div className="mb-4 inline-flex rounded-2xl bg-ink/5 p-3 text-ink">{icon}</div>
      <p className="text-sm text-ink/56">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}
