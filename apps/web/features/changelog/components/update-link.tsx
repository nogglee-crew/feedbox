"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";

export const CHANGELOG_SEEN_STORAGE = "feedbox:changelog-seen";

/**
 * "업데이트" 링크 + 미확인 dot.
 * 로그인 유저는 서버가 계산한 값(serverUnread)을 쓰고,
 * 비로그인은 localStorage의 마지막 확인 날짜와 최신 항목 날짜를 비교한다.
 */
export function UpdateLink({
  latestDate,
  serverUnread,
  className,
}: {
  latestDate: string | null;
  serverUnread: boolean | null;
  className?: string;
}) {
  const [unread, setUnread] = useState(serverUnread ?? false);

  useEffect(() => {
    if (serverUnread !== null || !latestDate) return;
    try {
      const seen = localStorage.getItem(CHANGELOG_SEEN_STORAGE);
      setUnread(!seen || seen < latestDate);
    } catch {
      // localStorage를 못 쓰는 환경이면 dot 없이 링크만 보여준다
    }
  }, [serverUnread, latestDate]);

  return (
    <Link href="/changelog" className={cn("relative", className)}>
      업데이트
      {unread && (
        <span aria-hidden className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}

/** /changelog 방문 시 비로그인 유저의 확인 상태를 기록한다 */
export function ChangelogSeenMarker({ latestDate }: { latestDate: string | null }) {
  useEffect(() => {
    if (!latestDate) return;
    try {
      localStorage.setItem(CHANGELOG_SEEN_STORAGE, latestDate);
    } catch {
      // 기록 실패는 무시 — dot이 계속 보일 뿐이다
    }
  }, [latestDate]);
  return null;
}
