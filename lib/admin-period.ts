export type AdminPeriodUnit = "day" | "week" | "month" | "all";

export type AdminPeriod = {
  unit: AdminPeriodUnit;
  dateKey: string;
  startKey: string | null;
  endKey: string | null;
  label: string;
  rangeLabel: string;
  metricLabel: string;
  chartLabel: string;
};

const SEOUL_TIME_ZONE = "Asia/Seoul";
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateKey: string, days: number) {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
}

function addMonths(dateKey: string, months: number) {
  const date = parseDateKey(dateKey);
  date.setUTCMonth(date.getUTCMonth() + months, 1);
  return toDateKey(date);
}

function startOfWeek(dateKey: string) {
  const date = parseDateKey(dateKey);
  const day = date.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + offset);
  return toDateKey(date);
}

function startOfMonth(dateKey: string) {
  const date = parseDateKey(dateKey);
  date.setUTCDate(1);
  return toDateKey(date);
}

function formatMonthDay(dateKey: string) {
  const date = parseDateKey(dateKey);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}

function formatKoreanDate(dateKey: string) {
  const date = parseDateKey(dateKey);
  return `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, "0")}.${String(date.getUTCDate()).padStart(2, "0")}`;
}

function formatKoreanMonth(dateKey: string) {
  const date = parseDateKey(dateKey);
  return `${date.getUTCFullYear()}년 ${date.getUTCMonth() + 1}월`;
}

function getWeekOfMonth(dateKey: string) {
  const date = parseDateKey(dateKey);
  const firstDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const firstDay = firstDate.getUTCDay();
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;
  return Math.ceil((date.getUTCDate() + mondayOffset) / 7);
}

export function normalizeAdminPeriod(
  unit?: string | null,
  dateKey?: string | null
): AdminPeriod {
  const safeUnit: AdminPeriodUnit =
    unit === "week" || unit === "month" || unit === "all" || unit === "day" ? unit : "day";
  const safeDateKey = dateKey && DATE_KEY_PATTERN.test(dateKey) ? dateKey : todayKey();

  if (safeUnit === "all") {
    return {
      unit: "all",
      dateKey: safeDateKey,
      startKey: null,
      endKey: null,
      label: "전체 기간",
      rangeLabel: "서비스 전체",
      metricLabel: "전체",
      chartLabel: "최근 30일"
    };
  }

  if (safeUnit === "month") {
    const startKey = startOfMonth(safeDateKey);
    const endKey = addMonths(startKey, 1);

    return {
      unit: "month",
      dateKey: startKey,
      startKey,
      endKey,
      label: formatKoreanMonth(startKey),
      rangeLabel: `${formatMonthDay(startKey)} - ${formatMonthDay(addDays(endKey, -1))}`,
      metricLabel: "월간",
      chartLabel: "월간 일별 추이"
    };
  }

  if (safeUnit === "week") {
    const startKey = startOfWeek(safeDateKey);
    const endKey = addDays(startKey, 7);

    return {
      unit: "week",
      dateKey: startKey,
      startKey,
      endKey,
      label: `${formatKoreanMonth(startKey)} ${getWeekOfMonth(startKey)}주차`,
      rangeLabel: `${formatMonthDay(startKey)} - ${formatMonthDay(addDays(endKey, -1))}`,
      metricLabel: "주간",
      chartLabel: "주간 일별 추이"
    };
  }

  return {
    unit: "day",
    dateKey: safeDateKey,
    startKey: safeDateKey,
    endKey: addDays(safeDateKey, 1),
    label: formatKoreanDate(safeDateKey),
    rangeLabel: formatMonthDay(safeDateKey),
    metricLabel: "일일",
    chartLabel: "선택일 기준"
  };
}

export function shiftAdminPeriod(period: AdminPeriod, direction: -1 | 1) {
  if (period.unit === "all") return period.dateKey;
  if (period.unit === "month") return addMonths(period.dateKey, direction);
  if (period.unit === "week") return addDays(period.dateKey, direction * 7);
  return addDays(period.dateKey, direction);
}

export function adminPeriodHref(unit: AdminPeriodUnit, dateKey: string) {
  const params = new URLSearchParams({ period: unit, date: dateKey });
  return `/admin?${params.toString()}`;
}

export function toSeoulTimestamp(dateKey: string) {
  return `${dateKey}T00:00:00+09:00`;
}
