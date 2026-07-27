"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * 공개 보드 조회수. made_by_badge_click의 CTR 분모라 클릭 계측만으로는 부족하다.
 * 보드는 서버 컴포넌트로 두고 이 컴포넌트만 클라이언트로 심는다.
 */
export function BoardViewTracker() {
  const sent = useRef(false);

  useEffect(() => {
    // StrictMode의 이중 마운트로 조회수가 두 배가 되지 않도록 막는다.
    if (sent.current) return;
    sent.current = true;
    trackEvent("board_view");
  }, []);

  return null;
}
