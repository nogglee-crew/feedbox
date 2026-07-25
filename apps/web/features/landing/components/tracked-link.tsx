"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent, type AnalyticsParams } from "@/lib/analytics";

/**
 * 랜딩은 서버 컴포넌트로 두고 클릭 계측이 필요한 링크만 이 컴포넌트로 감싼다.
 * 페이지 전체를 클라이언트 컴포넌트로 바꾸면 번들이 불필요하게 커진다.
 */
export function TrackedLink({
  href,
  event,
  eventParams,
  external = false,
  className,
  children,
}: {
  href: string;
  event: string;
  eventParams?: AnalyticsParams;
  /** 외부 도메인은 Link 프리페치가 의미 없어 a로 렌더한다 */
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const onClick = () => trackEvent(event, eventParams);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
