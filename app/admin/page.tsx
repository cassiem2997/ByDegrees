import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  MousePointerClick,
  Sparkles,
  Trophy
} from "lucide-react";

import { AdminChart } from "@/components/admin-chart";
import { AdminMaintenanceNoticeButton } from "@/components/admin-maintenance-notice-button";
import { AdminMaintenanceNotifyButton } from "@/components/admin-maintenance-notify-button";
import { SiteShell } from "@/components/layout/site-shell";
import { getAdminSummary } from "@/lib/analytics";
import {
  AdminPeriodUnit,
  adminPeriodHref,
  normalizeAdminPeriod,
  shiftAdminPeriod
} from "@/lib/admin-period";
import { getMaintenanceNoticeState } from "@/lib/db/maintenance-notice";
import { getMaintenanceSubscriberStats } from "@/lib/db/maintenance-subscribers";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatAdminNumber(value: number) {
  return value.toLocaleString("ko-KR");
}

function MetricCard({
  title,
  label,
  values,
  tone
}: {
  title: string;
  label: string;
  values: { current: number; cumulative: number };
  tone: "sky" | "mint" | "gold" | "coral";
}) {
  const toneClass = {
    sky: "from-sky/35 to-[#9bd8ff]/10",
    mint: "from-mint/35 to-sky/10",
    gold: "from-gold/40 to-peach/10",
    coral: "from-coral/35 to-peach/10"
  }[tone];

  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/75 bg-gradient-to-br p-5 shadow-[0_18px_48px_rgba(27,30,70,0.08)] backdrop-blur",
        toneClass
      )}
    >
      <p className="text-sm font-semibold text-ink/72">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">
        {formatAdminNumber(values.current)}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          [label, values.current],
          ["누적", values.cumulative]
        ].map(([label, value]) => (
          <div className="rounded-2xl bg-white/55 px-3 py-2" key={label}>
            <p className="text-xs text-ink/48">{label}</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {formatAdminNumber(Number(value))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompletionMetricCard({
  label,
  boardValues,
  completedSessions
}: {
  label: string;
  boardValues: { current: number; cumulative: number };
  completedSessions: number;
}) {
  return (
    <div className="rounded-[28px] border border-white/75 bg-gradient-to-br from-mint/35 to-sky/10 p-5 shadow-[0_18px_48px_rgba(27,30,70,0.08)] backdrop-blur">
      <p className="text-sm font-semibold text-ink/72">생성 완료</p>
      <p className="mt-3 text-3xl font-semibold text-ink">
        {formatAdminNumber(completedSessions)}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["이용자", completedSessions],
          ["보드", boardValues.current],
          ["누적 보드", boardValues.cumulative]
        ].map(([label, value]) => (
          <div className="rounded-2xl bg-white/55 px-3 py-2" key={label}>
            <p className="text-xs text-ink/48">{label}</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {formatAdminNumber(Number(value))}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink/45">{label} 이용자 기준, 보드 수 별도 표시</p>
    </div>
  );
}

function RateCard({
  title,
  value,
  caption,
  progress
}: {
  title: string;
  value: string;
  caption: string;
  progress: number;
}) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/72 p-5 shadow-[0_14px_34px_rgba(27,30,70,0.05)] backdrop-blur">
      <p className="text-xs font-semibold text-ink/50">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold text-ink">{value}</p>
        <div className="mb-1 h-2 flex-1 overflow-hidden rounded-full bg-ink/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-coral via-gold to-sky"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      </div>
      <p className="mt-1 text-xs text-ink/45">{caption}</p>
    </div>
  );
}

function FunnelStepCard({
  title,
  value,
  caption,
  tone
}: {
  title: string;
  value: number;
  caption: string;
  tone: "sky" | "mint" | "gold" | "coral";
}) {
  const toneClass = {
    sky: "bg-sky/16 text-ink",
    mint: "bg-mint/18 text-ink",
    gold: "bg-gold/22 text-ink",
    coral: "bg-coral/14 text-coral"
  }[tone];

  return (
    <div className="rounded-[24px] border border-white/70 bg-white/72 p-4 shadow-[0_14px_34px_rgba(27,30,70,0.05)] backdrop-blur">
      <div className={cn("mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold", toneClass)}>
        {title}
      </div>
      <p className="text-3xl font-semibold text-ink">{formatAdminNumber(value)}</p>
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

function SectionHeader({
  eyebrow,
  title
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-coral">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">{title}</h2>
      </div>
    </div>
  );
}

function EmptyText({ children }: { children: string }) {
  return <p className="rounded-2xl bg-ink/5 px-4 py-5 text-sm text-ink/45">{children}</p>;
}

type DonutDatum = {
  name: string;
  count: number;
};

const DONUT_COLORS = ["#ff6f61", "#ffb13b", "#3cc6d8", "#7ed88f", "#7b71e8", "#f38ac2"];

function compactDonutData(data: DonutDatum[], maxSlices = 5) {
  const sorted = [...data].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  if (sorted.length <= maxSlices) return sorted;

  const visible = sorted.slice(0, maxSlices);
  const otherCount = sorted.slice(maxSlices).reduce((total, item) => total + item.count, 0);
  return otherCount > 0 ? [...visible, { name: "기타", count: otherCount }] : visible;
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y
  ].join(" ");
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  };
}

function DonutChartCard({
  title,
  caption,
  data,
  emptyText,
  maxSlices = 5
}: {
  title: string;
  caption?: string;
  data: DonutDatum[];
  emptyText: string;
  maxSlices?: number;
}) {
  const chartData = compactDonutData(data, maxSlices);
  const total = chartData.reduce((sum, item) => sum + item.count, 0);
  let startAngle = 0;

  return (
    <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {caption ? <p className="mt-1 text-xs text-ink/45">{caption}</p> : null}
      {total === 0 ? (
        <div className="mt-4">
          <EmptyText>{emptyText}</EmptyText>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-[150px_1fr] sm:items-center">
          <div className="relative mx-auto h-[150px] w-[150px]">
            <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 160 160">
              <circle cx="80" cy="80" fill="none" r="54" stroke="rgba(28,27,27,0.08)" strokeWidth="24" />
              {chartData.map((item, index) => {
                const angle = (item.count / total) * 360;
                const endAngle = startAngle + angle;
                const path = describeArc(80, 80, 54, startAngle, endAngle);
                startAngle = endAngle;

                return (
                  <path
                    d={path}
                    fill="none"
                    key={item.name}
                    stroke={DONUT_COLORS[index % DONUT_COLORS.length]}
                    strokeLinecap="round"
                    strokeWidth="24"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/38">Total</span>
              <span className="mt-1 text-2xl font-semibold text-ink">{formatAdminNumber(total)}</span>
            </div>
          </div>
          <div className="space-y-2">
            {chartData.map((item, index) => {
              const percent = total > 0 ? (item.count / total) * 100 : 0;

              return (
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl bg-ink/5 px-3 py-2" key={item.name}>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                  />
                  <span className="truncate text-sm text-ink">{item.name}</span>
                  <span className="text-xs font-semibold text-ink/60">
                    {formatAdminNumber(item.count)} · {percent.toFixed(percent >= 10 ? 0 : 1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

type ConversionDatum = {
  name: string;
  visitors: number;
  creators: number;
  boards: number;
  conversionRate: number;
};

function ConversionTableCard({
  title,
  caption,
  data,
  emptyText
}: {
  title: string;
  caption: string;
  data: ConversionDatum[];
  emptyText: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs text-ink/45">{caption}</p>
      {data.length === 0 ? (
        <div className="mt-4">
          <EmptyText>{emptyText}</EmptyText>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[430px] border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/38">
                <th className="px-3">구분</th>
                <th className="px-3 text-right">방문</th>
                <th className="px-3 text-right">이용자</th>
                <th className="px-3 text-right">보드</th>
                <th className="px-3 text-right">전환</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr className="rounded-2xl bg-ink/5 text-sm text-ink" key={item.name}>
                  <td className="rounded-l-2xl px-3 py-2 font-semibold">{item.name}</td>
                  <td className="px-3 py-2 text-right">{formatAdminNumber(item.visitors)}</td>
                  <td className="px-3 py-2 text-right">{formatAdminNumber(item.creators)}</td>
                  <td className="px-3 py-2 text-right">{formatAdminNumber(item.boards)}</td>
                  <td className="rounded-r-2xl px-3 py-2 text-right font-semibold">
                    {formatRate(item.conversionRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
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
    <div className="rounded-[30px] border border-white/75 bg-white/75 p-4 shadow-[0_18px_48px_rgba(27,30,70,0.06)] backdrop-blur md:flex md:items-center md:justify-between md:gap-4">
      <div className="flex flex-wrap gap-2 md:w-auto">
        {units.map((unit) => (
          <Link
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ink/20",
              period.unit === unit.value
                ? "bg-ink text-white"
                : "bg-ink/5 text-ink/55 hover:bg-ink/10 hover:text-ink"
            )}
            href={adminPeriodHref(unit.value, normalizeAdminPeriod(unit.value).dateKey)}
            key={unit.value}
          >
            {unit.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-3xl bg-ink/5 px-3 py-3 md:mt-0 md:min-w-[360px]">
        {period.unit === "all" ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-full text-ink/25">
            <ChevronLeft size={20} />
          </span>
        ) : (
          <Link
            aria-label="이전 기간"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm transition hover:-translate-x-0.5 focus:outline-none focus:ring-2 focus:ring-ink/20"
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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm transition hover:translate-x-0.5 focus:outline-none focus:ring-2 focus:ring-ink/20"
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
  const [summary, maintenanceStats, maintenanceNotice] = await Promise.all([
    getAdminSummary(period),
    getMaintenanceSubscriberStats(),
    getMaintenanceNoticeState()
  ]);
  return (
    <SiteShell logoHref="https://by-degrees.vercel.app" logoNewTab>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[34px] border border-white/75 bg-white/78 shadow-[0_24px_70px_rgba(27,30,70,0.08)] backdrop-blur">
          <div className="bg-gradient-to-r from-coral/16 via-gold/14 to-sky/18 px-6 py-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-coral">Admin Dashboard</p>
            <h1 className="text-3xl font-semibold text-ink">By Degrees 운영 통계</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/56">
              기간을 넘겨보며 방문자 수, 이미지 길게 누른 횟수, 공유 수를 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <PeriodNavigation period={period} />

        <div className="rounded-[30px] border border-white/75 bg-white/75 p-5 shadow-[0_18px_48px_rgba(27,30,70,0.06)] backdrop-blur md:flex md:items-center md:justify-between md:gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-coral">Maintenance Notice</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              랜딩 점검 공지 {maintenanceNotice.active ? "ON" : "OFF"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink/56">
              음악 검색 오류가 발생하면 자동으로 켜집니다. 복구 확인 후 수동으로 내려주세요.
            </p>
            {maintenanceNotice.active ? (
              <p className="mt-2 text-xs leading-5 text-ink/50">
                route: {maintenanceNotice.route ?? "-"} / query: {maintenanceNotice.query ?? "-"}
              </p>
            ) : null}
          </div>
          <div className="mt-4 md:mt-0">
            <AdminMaintenanceNoticeButton active={maintenanceNotice.active} />
          </div>
        </div>

        <div className="rounded-[30px] border border-white/75 bg-white/75 p-5 shadow-[0_18px_48px_rgba(27,30,70,0.06)] backdrop-blur md:flex md:items-center md:justify-between md:gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-coral">Maintenance</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">점검 완료 알림</h2>
            <p className="mt-2 text-sm leading-6 text-ink/56">
              미발송 신청자 이메일을 복사하고 Gmail 작성창을 엽니다. 발송 후 notified_at은 수동으로 기록해주세요.
            </p>
          </div>
          <div className="mt-4 grid gap-3 md:mt-0 md:min-w-[360px] md:grid-cols-[1fr_auto] md:items-center">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-ink/5 px-3 py-3">
                <p className="text-xs text-ink/48">전체</p>
                <p className="mt-1 text-lg font-semibold text-ink">{maintenanceStats.total}</p>
              </div>
              <div className="rounded-2xl bg-gold/18 px-3 py-3">
                <p className="text-xs text-ink/48">미발송</p>
                <p className="mt-1 text-lg font-semibold text-ink">{maintenanceStats.pending}</p>
              </div>
              <div className="rounded-2xl bg-mint/16 px-3 py-3">
                <p className="text-xs text-ink/48">발송완료</p>
                <p className="mt-1 text-lg font-semibold text-ink">{maintenanceStats.notified}</p>
              </div>
            </div>
            <AdminMaintenanceNotifyButton pendingCount={maintenanceStats.pending} />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(4,minmax(180px,1fr))] gap-4 overflow-x-auto pb-1">
          <MetricCard title="방문자 수" label={period.metricLabel} tone="sky" values={summary.visitors} />
          <CompletionMetricCard
            boardValues={summary.boardsCreated}
            completedSessions={summary.funnel.completedSessions}
            label={period.metricLabel}
          />
          <MetricCard title="이미지 길게 누른 횟수" label={period.metricLabel} tone="gold" values={summary.imageSaves} />
          <MetricCard title="이미지 및 링크 공유 횟수" label={period.metricLabel} tone="coral" values={summary.shares} />
        </div>

        <div className="space-y-3">
          <SectionHeader eyebrow="Funnel" title="방문에서 공유까지" />
          <div className="grid gap-3 md:grid-cols-4">
            <FunnelStepCard
              caption="페이지를 방문한 고유 세션"
              title="방문"
              tone="sky"
              value={summary.visitors.current}
            />
            <FunnelStepCard
              caption="미리보기까지 완료한 고유 세션"
              title="생성 완료 이용자"
              tone="mint"
              value={summary.funnel.completedSessions}
            />
            <FunnelStepCard
              caption="생성 완료 후 저장을 시도한 고유 세션"
              title="저장 시도 이용자"
              tone="gold"
              value={summary.funnel.savedCompletedSessions}
            />
            <FunnelStepCard
              caption="생성 완료 후 공유를 시도한 고유 세션"
              title="공유 이용자"
              tone="coral"
              value={summary.funnel.sharedCompletedSessions}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RateCard
              caption="방문자 대비 생성 완료 이용자"
              progress={summary.funnel.visitToCreateRate}
              title="방문 → 생성"
              value={formatRate(summary.funnel.visitToCreateRate)}
            />
            <RateCard
              caption="생성 완료 세션 중 저장"
              progress={summary.funnel.createToSaveRate}
              title="생성 → 저장"
              value={formatRate(summary.funnel.createToSaveRate)}
            />
            <RateCard
              caption="생성 완료 세션 중 공유"
              progress={summary.funnel.createToShareRate}
              title="생성 → 공유"
              value={formatRate(summary.funnel.createToShareRate)}
            />
            <RateCard
              caption="완성된 플리 1개당 평균"
              progress={(summary.funnel.averageSongsPerBoard / 24) * 100}
              title="평균 선택 곡 수"
              value={formatAverage(summary.funnel.averageSongsPerBoard)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeader eyebrow="Temperature" title="기온 구간 인사이트" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-coral/12 text-coral">
                  <MousePointerClick size={20} />
                </span>
                <p className="text-sm font-semibold text-ink">가장 많이 비는 기온 구간</p>
              </div>
              {summary.temperatureInsights.emptiest ? (
                <div className="mt-4 rounded-2xl bg-coral/8 px-4 py-4">
                  <p className="text-2xl font-semibold text-ink">
                    {summary.temperatureInsights.emptiest.label}
                  </p>
                  <p className="mt-1 text-sm text-ink/55">
                    {summary.temperatureInsights.emptiest.totalBoards}개 중{" "}
                    {summary.temperatureInsights.emptiest.count}개 플리에서 비어 있었어요.
                  </p>
                </div>
              ) : (
                <EmptyText>아직 비교할 플레이리스트 데이터가 없습니다.</EmptyText>
              )}
            </div>

            <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint/16 text-ink">
                  <Sparkles size={20} />
                </span>
                <p className="text-sm font-semibold text-ink">가장 많이 채워지는 기온 구간</p>
              </div>
              {summary.temperatureInsights.fullest ? (
                <div className="mt-4 rounded-2xl bg-mint/12 px-4 py-4">
                  <p className="text-2xl font-semibold text-ink">
                    {summary.temperatureInsights.fullest.label}
                  </p>
                  <p className="mt-1 text-sm text-ink/55">
                    {summary.temperatureInsights.fullest.totalBoards}개 플리에서 총{" "}
                    {summary.temperatureInsights.fullest.count}곡이 배치됐어요.
                  </p>
                </div>
              ) : (
                <EmptyText>아직 비교할 플레이리스트 데이터가 없습니다.</EmptyText>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeader eyebrow="Traffic" title="방문 흐름" />
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <AdminChart label={period.chartLabel} metric="pageViews" series={summary.dailySeries} />
            <DonutChartCard
              data={summary.visitorCountries}
              emptyText="아직 집계된 데이터가 없습니다."
              title="국가별 방문자 수"
            />
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeader eyebrow="Conversion" title="국가와 언어 전환율" />
          <div className="grid gap-4 xl:grid-cols-3">
            <ConversionTableCard
              caption="방문 세션 대비 생성 완료 이용자 기준"
              data={summary.countryConversions}
              emptyText="아직 국가별 전환 데이터가 없습니다."
              title="국가별 전환율"
            />
            <ConversionTableCard
              caption="첫 진입 페이지 언어 기준"
              data={summary.languageConversions}
              emptyText="아직 언어별 전환 데이터가 없습니다."
              title="언어별 전환율"
            />
            <ConversionTableCard
              caption="영어 페이지 첫 진입 세션 기준"
              data={summary.geoRedirectConversions}
              emptyText="아직 geo redirect 전환 데이터가 없습니다."
              title="Geo redirect 성과"
            />
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeader eyebrow="Completion Location" title="완성 이용자 지역" />
          <div className="grid gap-4 lg:grid-cols-2">
            <DonutChartCard
              caption="플레이리스트 생성 완료 세션 기준"
              data={summary.completedCountries}
              emptyText="아직 완성 이용자 지역 데이터가 없습니다."
              title="국가별 이용자 수"
            />

            <DonutChartCard
              caption="플레이리스트 생성 완료 세션 기준"
              data={summary.completedContinents}
              emptyText="아직 완성 이용자 지역 데이터가 없습니다."
              maxSlices={6}
              title="대륙별 이용자 수"
            />
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeader eyebrow="Creation" title="생성 추이와 지역" />
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <AdminChart label={period.chartLabel} metric="creates" series={summary.dailySeries} />
            <DonutChartCard
              data={summary.visitorContinents}
              emptyText="아직 방문자 데이터가 없습니다."
              maxSlices={6}
              title="대륙별 방문자 수"
            />
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeader eyebrow="Popularity" title="완성된 취향" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/20 text-ink">
                  <Trophy size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">완성 기준 인기 아티스트 TOP 10</p>
                  <p className="mt-1 text-xs text-ink/45">실제로 생성 완료된 플레이리스트 기준</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {summary.topArtists.length === 0 ? (
                  <EmptyText>아직 집계된 데이터가 없습니다.</EmptyText>
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
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/20 text-ink">
                  <Flame size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">완성 기준 인기 곡 TOP 10</p>
                  <p className="mt-1 text-xs text-ink/45">생성 완료된 플리에 배치된 곡 기준</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {summary.topSongs.length === 0 ? (
                  <EmptyText>아직 완성된 플레이리스트 데이터가 없습니다.</EmptyText>
                ) : (
                  summary.topSongs.map((song, index) => (
                    <div className="rounded-2xl bg-ink/5 px-4 py-3" key={song.providerTrackId}>
                      <p className="text-sm text-ink">
                        {index + 1}. {song.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-ink/45">{song.artistName}</p>
                      <p className="mt-1 text-xs text-ink/55">{song.count} placements</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </SiteShell>
  );
}
