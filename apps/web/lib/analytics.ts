"use client";

import { sendGAEvent } from "@next/third-parties/google";

export type AnalyticsParams = Record<string, string | number | boolean>;

/**
 * GA4 커스텀 이벤트 전송.
 * GA ID가 없으면 gtag 자체가 렌더되지 않으므로, 경고 로그를 남기지 않도록 먼저 걸러낸다.
 */
export function trackEvent(name: string, params?: AnalyticsParams) {
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  sendGAEvent("event", name, params ?? {});
}
