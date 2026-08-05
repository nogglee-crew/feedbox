export type DateTimeStyle = "date" | "time" | "dateTime" | "shortDate" | "shortDateTime";

/**
 * 서버 렌더와 클라이언트 첫 렌더가 같은 시간대를 써야 hydration이 어긋나지 않는다.
 * 접속자 시간대는 마운트 이후에만 알 수 있으므로 그전까지는 이 값으로 그린다.
 */
export const FALLBACK_TIME_ZONE = "Asia/Seoul";

const STYLE_OPTIONS: Record<DateTimeStyle, Intl.DateTimeFormatOptions> = {
  date: { year: "numeric", month: "numeric", day: "numeric" },
  time: { hour: "numeric", minute: "numeric", second: "numeric" },
  dateTime: {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  },
  shortDate: { year: "2-digit", month: "2-digit", day: "2-digit" },
  shortDateTime: {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  },
};

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(
  value: string | Date | null | undefined,
  style: DateTimeStyle = "dateTime",
  timeZone: string = FALLBACK_TIME_ZONE,
): string {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("ko-KR", { ...STYLE_OPTIONS[style], timeZone }).format(date);
}

/**
 * 코멘트 등 대화형 타임스탬프의 상대 표기.
 * 방금 → N분 전 → N시간 전 → 어제 → N일 전, 한 달이 넘으면 날짜로 바꾼다.
 * 날짜 표기만 시간대의 영향을 받는다.
 */
export function formatRelativeTime(
  value: string | Date | null | undefined,
  timeZone: string = FALLBACK_TIME_ZONE,
): string {
  const date = toDate(value);
  if (!date) return "-";
  const seconds = (Date.now() - date.getTime()) / 1000;
  if (seconds < 60) return "방금";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 2) return "어제";
  if (days < 30) return `${days}일 전`;
  return formatDateTime(date, "shortDate", timeZone);
}

/**
 * 마지막 활동이 얼마나 지났는지 훑기 위한 상대 표기.
 * 경과 시간만 쓰므로 시간대와 무관하다.
 */
export function formatSince(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "-";
  const days = (Date.now() - date.getTime()) / 86_400_000;
  if (days < 1) return "오늘";
  if (days < 2) return "어제";
  if (days < 30) return `${Math.floor(days)}일 전`;
  return `${Math.floor(days / 30)}개월 전`;
}
