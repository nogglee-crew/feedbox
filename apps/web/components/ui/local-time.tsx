"use client";

import { useEffect, useState } from "react";
import { formatDateTime, type DateTimeStyle } from "@/lib/datetime";

/**
 * 타임스탬프를 접속자 시간대로 표시한다.
 *
 * 서버는 접속자 시간대를 알 수 없어 KST로 그리고, 마운트 이후 실제 시간대로 교체한다.
 * 클라이언트 첫 렌더도 같은 KST 값을 내므로 hydration은 어긋나지 않는다.
 */
export function LocalTime({
  value,
  style = "dateTime",
  className,
}: {
  value: string | Date | null | undefined;
  style?: DateTimeStyle;
  className?: string;
}) {
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const iso = value instanceof Date ? value.toISOString() : (value ?? undefined);
  return (
    <time dateTime={iso} className={className}>
      {formatDateTime(value, style, timeZone)}
    </time>
  );
}
