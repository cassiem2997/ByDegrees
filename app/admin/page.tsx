import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AdminChart } from "@/components/admin-chart";
import { SiteShell } from "@/components/layout/site-shell";
import { getAdminSummary } from "@/lib/analytics";
import {
  AdminPeriodUnit,
  adminPeriodHref,
  normalizeAdminPeriod,
  shiftAdminPeriod
} from "@/lib/admin-period";
import { cn, formatShortNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function MetricCard({
  title,
  label,
  values
}: {
  title: string;
  label: string;
  values: { current: number; cumulative: number };
}) {
  return (
    <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 shadow-[0_18px_48px_rgba(27,30,70,0.08)] backdrop-blur">
      <p className="mb-4 text-sm font-semibold text-ink">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          [label, values.current],
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

function RateCard({
  title,
  value,
  caption
}: {
  title: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-[0_14px_34px_rgba(27,30,70,0.06)] backdrop-blur">
      <p className="text-xs font-semibold text-ink/50">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink/45">{caption}</p>
    </div>
  );
}

function formatRate(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function formatAverage(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}곡`;
}

function PeriodNavigation({ period }: { period: ReturnType<typeof normalizeAdminPeriod> }) {
  const units: Array<{ value: AdminPeriodUnit; label: string }> = [
    { value: "day", label: "일일" },
    { value: "week", label: "주간" },
    { value: "month", label: "월간" },
    { value: "all", label: "전체" }
  ];
  const previousDate = shiftAdminPeriod(period, -1);
  const nextDate = shiftAdminPeriod(period, 1);

  return (
    <div className="rounded-[28px] border border-white/75 bg-white/75 p-4 shadow-[0_18px_48px_rgba(27,30,70,0.06)] backdrop-blur">
      <div className="flex flex-wrap gap-2">
        {units.map((unit) => (
          <Link
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              period.unit === unit.value
                ? "bg-ink text-white"
                : "bg-ink/5 text-ink/55 hover:bg-ink/10 hover:text-ink"
            )}
            href={adminPeriodHref(unit.value, period.dateKey)}
            key={unit.value}
          >
            {unit.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-3xl bg-ink/5 px-3 py-3">
        {period.unit === "all" ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-full text-ink/25">
            <ChevronLeft size={20} />
          </span>
        ) : (
          <Link
            aria-label="이전 기간"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm"
            href={adminPeriodHref(period.unit, previousDate)}
          >
            <ChevronLeft size={20} />
          </Link>
        )}

        <div className="min-w-0 text-center">
          <p className="truncate text-base font-semibold text-ink">{period.label}</p>
          <p className="mt-1 text-xs text-ink/50">{period.rangeLabel}</p>
        </div>

        {period.unit === "all" ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-full text-ink/25">
            <ChevronRight size={20} />
          </span>
        ) : (
          <Link
            aria-label="다음 기간"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm"
            href={adminPeriodHref(period.unit, nextDate)}
          >
            <ChevronRight size={20} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const params = await searchParams;
  const period = normalizeAdminPeriod(params.period, params.date);
  const summary = await getAdminSummary(period);

  return (
    <SiteShell>
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/75 bg-white/75 p-6 backdrop-blur">
          <p className="mb-2 text-sm font-semibold text-coral">Admin Dashboard</p>
          <h1 className="text-3xl font-semibold text-ink">By Degrees 운영 통계</h1>
          <p className="mt-2 text-sm text-ink/56">
            기간을 넘겨보며 방문자 수, 이미지 저장 수, 공유 수를 확인할 수 있습니다.
          </p>
        </div>

        <PeriodNavigation period={period} />

        <div className="grid gap-4 xl:grid-cols-4">
          <MetricCard title="방문자 수" label={period.metricLabel} values={summary.visitors} />
          <MetricCard title="플레이리스트 생성 완료" label={period.metricLabel} values={summary.boardsCreated} />
          <MetricCard title="이미지 저장 횟수" label={period.metricLabel} values={summary.imageSaves} />
          <MetricCard title="이미지 및 링크 공유 횟수" label={period.metricLabel} values={summary.shares} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RateCard
            caption="방문자 대비 생성 완료"
            title="방문 → 생성"
            value={formatRate(summary.funnel.visitToCreateRate)}
          />
          <RateCard
            caption="생성 완료 대비 저장"
            title="생성 → 저장"
            value={formatRate(summary.funnel.createToSaveRate)}
          />
          <RateCard
            caption="생성 완료 대비 공유"
            title="생성 → 공유"
            value={formatRate(summary.funnel.createToShareRate)}
          />
          <RateCard
            caption="완성된 플리 1개당 평균"
            title="평균 선택 곡 수"
            value={formatAverage(summary.funnel.averageSongsPerBoard)}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-ink">가장 많이 비는 기온 구간</p>
            {summary.temperatureInsights.emptiest ? (
              <div className="mt-4 rounded-2xl bg-ink/5 px-4 py-4">
                <p className="text-2xl font-semibold text-ink">
                  {summary.temperatureInsights.emptiest.label}
                </p>
                <p className="mt-1 text-sm text-ink/55">
                  {summary.temperatureInsights.emptiest.totalBoards}개 중{" "}
                  {summary.temperatureInsights.emptiest.count}개 플리에서 비어 있었어요.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink/45">아직 비교할 플레이리스트 데이터가 없습니다.</p>
            )}
          </div>

          <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-ink">가장 많이 채워지는 기온 구간</p>
            {summary.temperatureInsights.fullest ? (
              <div className="mt-4 rounded-2xl bg-ink/5 px-4 py-4">
                <p className="text-2xl font-semibold text-ink">
                  {summary.temperatureInsights.fullest.label}
                </p>
                <p className="mt-1 text-sm text-ink/55">
                  {summary.temperatureInsights.fullest.totalBoards}개 플리에서 총{" "}
                  {summary.temperatureInsights.fullest.count}곡이 배치됐어요.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink/45">아직 비교할 플레이리스트 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <AdminChart label={period.chartLabel} metric="pageViews" series={summary.dailySeries} />
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
          <AdminChart label={period.chartLabel} metric="creates" series={summary.dailySeries} />
          <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-ink">대륙별 방문자 수</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {summary.visitorContinents.length === 0 ? (
                <p className="text-sm text-ink/45">아직 방문자 데이터가 없습니다.</p>
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
            <p className="text-sm font-semibold text-ink">완성 기준 인기 아티스트 TOP 5</p>
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
            <p className="text-sm font-semibold text-ink">완성 기준 인기 곡 TOP 10</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {summary.topSongs.length === 0 ? (
                <p className="text-sm text-ink/45">아직 완성된 플레이리스트 데이터가 없습니다.</p>
              ) : (
                summary.topSongs.map((song, index) => (
                  <div className="rounded-2xl bg-ink/5 px-4 py-3" key={song.title}>
                    <p className="text-sm text-ink">
                      {index + 1}. {song.title}
                    </p>
                    <p className="mt-1 text-xs text-ink/55">{song.count} placements</p>
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
