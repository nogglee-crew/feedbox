"use client";

import { sendGAEvent } from "@next/third-parties/google";

export type AnalyticsParams = Record<string, string | number | boolean>;

const ANON_ID_KEY = "feedbox_anon_id";
const SESSION_KEY = "feedbox_session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const SENSITIVE_VALUE_PATTERNS = [
  { pattern: /\/board\/[^/?#\s]+/g, replacement: "/board/[token]" },
  { pattern: /#session=[^&#\s]+/g, replacement: "#session=[token]" },
];

function readAnonId(): string | null {
  try {
    let id = localStorage.getItem(ANON_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_ID_KEY, id);
    }
    return id;
  } catch {
    // 시크릿 모드나 스토리지 차단 환경에서는 자체 계측을 포기한다.
    return null;
  }
}

/** GA4와 동일하게 30분 무활동이면 새 세션으로 끊는다. */
function readSessionId(): string | null {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(SESSION_KEY);
    const parsed = raw ? (JSON.parse(raw) as { id?: string; lastSeen?: number }) : null;
    const id =
      parsed?.id && parsed.lastSeen && now - parsed.lastSeen < SESSION_TIMEOUT_MS
        ? parsed.id
        : crypto.randomUUID();

    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, lastSeen: now }));
    return id;
  } catch {
    return null;
  }
}

function sendSelfHosted(name: string, params?: AnalyticsParams) {
  const anonId = readAnonId();
  const sessionId = readSessionId();
  if (!anonId || !sessionId) return;

  // 조직은 서버가 경로와 멤버십으로 판정한다. 클라이언트가 보낸 값은 신뢰할 수 없다.
  const payload = JSON.stringify({
    name,
    anonId,
    sessionId,
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    params,
  });

  try {
    // 페이지 이동 중에도 유실되지 않도록 beacon을 우선 쓴다.
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/events", blob)) return;
  } catch {
    // fetch로 넘어간다.
  }

  void fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // 계측 실패가 사용자 동작을 방해해서는 안 된다.
  });
}

function sanitizeAnalyticsParams(params?: AnalyticsParams): AnalyticsParams | undefined {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      typeof value === "string" ? redactSensitiveValue(value) : value,
    ]),
  );
}

function redactSensitiveValue(value: string): string {
  return SENSITIVE_VALUE_PATTERNS.reduce(
    (current, rule) => current.replace(rule.pattern, rule.replacement),
    value,
  );
}

/**
 * 유입 분석은 GA4, 제품 내부 행동은 자체 수집이 담당한다.
 * 애드블록으로 GA4가 차단되는 비율을 재려면 당분간 양쪽에 모두 보낸다.
 */
export function trackEvent(name: string, params?: AnalyticsParams) {
  const safeParams = sanitizeAnalyticsParams(params);
  if (process.env.NEXT_PUBLIC_GA_ID) {
    sendGAEvent("event", name, safeParams ?? {});
  }
  sendSelfHosted(name, safeParams);
}
