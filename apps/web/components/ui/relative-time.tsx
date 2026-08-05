"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/datetime";

/**
 * 대화형 타임스탬프의 상대 표기 (방금 / N분 전 / 어제 / 날짜).
 *
 * 서버와 클라이언트의 "지금"이 근소하게 달라 경계값에서 표기가 어긋날 수 있으므로
 * hydration 불일치를 허용하고 클라이언트 값을 쓴다. 날짜 폴백은 LocalTime과 같은
 * 방식으로 마운트 후 접속자 시간대로 교체한다.
 */
export function RelativeTime({
  value,
  className,
}: {
  value: string | Date | null | undefined;
  className?: string;
}) {
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const iso = value instanceof Date ? value.toISOString() : (value ?? undefined);
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {formatRelativeTime(value, timeZone)}
    </time>
  );
}
