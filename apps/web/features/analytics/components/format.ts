/** 운영 화면 전용 표시 형식. 목록 다섯 곳이 같은 형식을 써야 비교가 쉽다. */

export function formatDate(value: Date | null | undefined): string {
  if (!value) return "-";
  return value.toLocaleDateString("ko-KR", { year: "2-digit", month: "2-digit", day: "2-digit" });
}

export function formatDateTime(value: Date | null | undefined): string {
  if (!value) return "-";
  return value.toLocaleString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 목록에서 마지막 활동이 얼마나 오래됐는지 한눈에 보기 위한 상대 표기. */
export function formatSince(value: Date | null | undefined): string {
  if (!value) return "-";
  const days = (Date.now() - value.getTime()) / 86_400_000;
  if (days < 1) return "오늘";
  if (days < 2) return "어제";
  if (days < 30) return `${Math.floor(days)}일 전`;
  return `${Math.floor(days / 30)}개월 전`;
}
