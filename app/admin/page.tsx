import { BarChart3, Download, Music2, Users } from "lucide-react";

import { AdminChart } from "@/components/admin-chart";
import { SiteShell } from "@/components/layout/site-shell";
import { getAdminSummary } from "@/lib/analytics";
import { formatShortNumber } from "@/lib/utils";

function MetricCard({
  title,
  values
}: {
  title: string;
  values: { daily: number; weekly: number; monthly: number; cumulative: number };
}) {
  return (
    <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 shadow-[0_18px_48px_rgba(27,30,70,0.08)] backdrop-blur">
      <p className="mb-4 text-sm font-semibold text-ink">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["일일", values.daily],
          ["주간", values.weekly],
          ["월간", values.monthly],
          ["누적", values.cumulative]
        ].map(([label, value]) => (
          <div className="rounded-2xl bg-ink/5 px-4 py-3" key={label}>
            <p className="text-xs text-ink/48">{label}</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {formatShortNumber(Number(value))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const summary = await getAdminSummary();

  return (
    <SiteShell>
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/75 bg-white/75 p-6 backdrop-blur">
          <p className="mb-2 text-sm font-semibold text-coral">Admin Dashboard</p>
          <h1 className="text-3xl font-semibold text-ink">By Degrees 운영 통계</h1>
          <p className="mt-2 text-sm text-ink/56">
            방문자 수, 이미지 저장 수, 공유 수를 일/주/월/누적으로 확인할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <MetricCard title="방문자 수" values={summary.visitors} />
          <MetricCard title="이미지 저장 횟수" values={summary.imageSaves} />
          <MetricCard title="이미지 및 링크 공유 횟수" values={summary.shares} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <AdminChart metric="pageViews" series={summary.dailySeries} />
          <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-ink">국가별 방문자 수</p>
            <div className="mt-4 space-y-3">
              {summary.visitorCountries.length === 0 ? (
                <p className="text-sm text-ink/45">아직 집계된 데이터가 없습니다.</p>
              ) : (
                summary.visitorCountries.map((country, index) => (
                  <div className="flex items-center justify-between rounded-2xl bg-ink/5 px-4 py-3" key={country.name}>
                    <span className="text-sm text-ink">
                      {index + 1}. {country.name}
                    </span>
                    <span className="text-sm font-semibold text-ink">{country.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <AdminChart metric="shares" series={summary.dailySeries} />
          <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-ink">대륙별 방문자 수</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {summary.visitorContinents.length === 0 ? (
                <p className="text-sm text-ink/45">아직 곡 선택 데이터가 없습니다.</p>
              ) : (
                summary.visitorContinents.map((continent, index) => (
                  <div className="rounded-2xl bg-ink/5 px-4 py-3" key={continent.name}>
                    <p className="text-sm text-ink">
                      {index + 1}. {continent.name}
                    </p>
                    <p className="mt-1 text-xs text-ink/55">{continent.count} visitors</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-ink">인기 아티스트 TOP 5</p>
            <div className="mt-4 space-y-3">
              {summary.topArtists.length === 0 ? (
                <p className="text-sm text-ink/45">아직 집계된 데이터가 없습니다.</p>
              ) : (
                summary.topArtists.map((artist, index) => (
                  <div className="flex items-center justify-between rounded-2xl bg-ink/5 px-4 py-3" key={artist.name}>
                    <span className="text-sm text-ink">
                      {index + 1}. {artist.name}
                    </span>
                    <span className="text-sm font-semibold text-ink">{artist.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-ink">인기 곡 TOP 10</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {summary.topSongs.length === 0 ? (
                <p className="text-sm text-ink/45">아직 곡 선택 데이터가 없습니다.</p>
              ) : (
                summary.topSongs.map((song, index) => (
                  <div className="rounded-2xl bg-ink/5 px-4 py-3" key={song.title}>
                    <p className="text-sm text-ink">
                      {index + 1}. {song.title}
                    </p>
                    <p className="mt-1 text-xs text-ink/55">{song.count} selections</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
