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
import { canSendMaintenanceEmail } from "@/lib/email";
import { cn, formatShortNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        {formatShortNumber(values.current)}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          [label, values.current],
          ["누적", values.cumulative]
        ].map(([label, value]) => (
          <div className="rounded-2xl bg-white/55 px-3 py-2" key={label}>
            <p className="text-xs text-ink/48">{label}</p>
            <p className="mt-1 text-sm font-semibold text-ink">
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
      <p className="text-3xl font-semibold text-ink">{formatShortNumber(value)}</p>
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
            href={adminPeriodHref(unit.value, period.dateKey)}
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
  const canSendMaintenanceNotifications = canSendMaintenanceEmail();

  return (
    <SiteShell>
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
              미발송 신청자에게 점검 완료 메일을 수동으로 발송합니다. 성공한 대상은 notified_at이 기록됩니다.
            </p>
            {!canSendMaintenanceNotifications ? (
              <p className="mt-2 text-xs font-semibold text-coral">
                RESEND_API_KEY와 MAINTENANCE_EMAIL_FROM 설정이 필요합니다.
              </p>
            ) : null}
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
            <AdminMaintenanceNotifyButton
              disabled={!canSendMaintenanceNotifications}
              pendingCount={maintenanceStats.pending}
            />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(4,minmax(180px,1fr))] gap-4 overflow-x-auto pb-1">
          <MetricCard title="방문자 수" label={period.metricLabel} tone="sky" values={summary.visitors} />
          <MetricCard title="플레이리스트 생성 완료" label={period.metricLabel} tone="mint" values={summary.boardsCreated} />
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
              caption="미리보기까지 완료한 수"
              title="생성 완료"
              tone="mint"
              value={summary.boardsCreated.current}
            />
            <FunnelStepCard
              caption="저장용 이미지를 길게 누른 횟수"
              title="이미지 길게 누름"
              tone="gold"
              value={summary.imageSaves.current}
            />
            <FunnelStepCard
              caption="X 공유 또는 링크 복사"
              title="공유"
              tone="coral"
              value={summary.shares.current}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RateCard
              caption="방문자 대비 생성 완료"
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
            <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-ink">국가별 방문자 수</p>
              <div className="mt-4 space-y-3">
                {summary.visitorCountries.length === 0 ? (
                  <EmptyText>아직 집계된 데이터가 없습니다.</EmptyText>
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
        </div>

        <div className="space-y-3">
          <SectionHeader eyebrow="Creation" title="생성 추이와 지역" />
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <AdminChart label={period.chartLabel} metric="creates" series={summary.dailySeries} />
            <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-ink">대륙별 방문자 수</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {summary.visitorContinents.length === 0 ? (
                  <EmptyText>아직 방문자 데이터가 없습니다.</EmptyText>
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
                  <p className="text-sm font-semibold text-ink">완성 기준 인기 아티스트 TOP 5</p>
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

        <div className="space-y-3">
          <SectionHeader eyebrow="Exploration" title="궁금해서 눌러본 취향" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/75 bg-white/75 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-ink">탐색 기준 인기 아티스트 TOP 5</p>
              <p className="mt-1 text-xs text-ink/45">제작 중 선택해본 아티스트 기준</p>
              <div className="mt-4 space-y-3">
                {summary.exploredArtists.length === 0 ? (
                  <EmptyText>아직 아티스트 선택 데이터가 없습니다.</EmptyText>
                ) : (
                  summary.exploredArtists.map((artist, index) => (
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
              <p className="text-sm font-semibold text-ink">탐색 기준 인기 곡 TOP 10</p>
              <p className="mt-1 text-xs text-ink/45">제작 중 카드에 올려본 곡 기준</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {summary.exploredSongs.length === 0 ? (
                  <EmptyText>아직 곡 선택 데이터가 없습니다.</EmptyText>
                ) : (
                  summary.exploredSongs.map((song, index) => (
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
      </div>
    </SiteShell>
  );
}
