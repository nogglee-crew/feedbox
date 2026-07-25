"use client";

import Image from "next/image";
import { trackEvent } from "@/lib/analytics";

/**
 * 고객사가 보는 공개 화면에만 노출하는 출처 배지.
 * SDK 툴바(우측 하단)와 겹치지 않도록 하단 중앙에 고정한다.
 */
export function MadeByBadge() {
  return (
    <a
      href="/?ref=board"
      target="_blank"
      rel="noreferrer"
      // 보드 page_view가 분모라 클릭만 잡으면 배지 CTR이 나온다
      onClick={() => trackEvent("made_by_badge_click")}
      className="fixed bottom-5 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-1.5 text-xs text-subtle shadow-lg backdrop-blur-sm transition-colors hover:border-border-strong hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle"
    >
      Made by
      <Image
        src="/feedbox-logo.png"
        alt="FEEDBOX"
        width={1468}
        height={284}
        className="h-3 w-auto"
      />
    </a>
  );
}
