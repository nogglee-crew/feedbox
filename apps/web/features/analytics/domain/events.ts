/**
 * 자체 계측 이벤트 정의.
 * 수집 엔드포인트가 공개돼 있으므로 allowlist가 1차 방어선이다. 모르는 이름은 저장하지 않는다.
 */

/** 브라우저에서 전송한다. */
export const CLIENT_EVENT_NAMES = [
  "cta_signin_click",
  "demo_click",
  "github_click",
  "install_prompt_copy",
  "sdk_key_copy",
  "qa_url_copy",
  "issue_copy_for_agent",
  "made_by_badge_click",
  "board_view",
] as const;

/** 소유권 검증이 끝난 usecase에서 직접 기록한다. 엔드포인트로는 받지 않는다. */
export const SERVER_EVENT_NAMES = [
  "org_create",
  "project_create",
  "release_create",
  "qa_session_create",
] as const;

export type ClientEventName = (typeof CLIENT_EVENT_NAMES)[number];
export type ServerEventName = (typeof SERVER_EVENT_NAMES)[number];

export type EventParams = Record<string, string | number | boolean>;

const MAX_PARAM_KEYS = 10;
const MAX_KEY_LENGTH = 40;
const MAX_VALUE_LENGTH = 200;
const SENSITIVE_VALUE_PATTERNS = [
  { pattern: /\/board\/[^/?#\s]+/g, replacement: "/board/[token]" },
  { pattern: /#session=[^&#\s]+/g, replacement: "#session=[token]" },
];

export function isClientEventName(value: unknown): value is ClientEventName {
  return typeof value === "string" && CLIENT_EVENT_NAMES.includes(value as ClientEventName);
}

/** 식별자는 클라이언트가 만든 난수라 형태만 검사한다. */
export function isValidIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length >= 8 && value.length <= 64;
}

/**
 * 저장 가능한 형태로 params를 좁힌다.
 * 중첩 객체는 통째로 버린다. 계측 값은 평면 스칼라면 충분하고,
 * 중첩을 허용하면 페이로드 크기를 예측할 수 없다.
 */
export function sanitizeParams(raw: unknown): EventParams | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;

  const result: EventParams = {};
  let count = 0;
  for (const [key, value] of Object.entries(raw)) {
    if (count >= MAX_PARAM_KEYS) break;
    if (!key || key.length > MAX_KEY_LENGTH) continue;

    if (typeof value === "string") {
      result[key] = redactSensitiveValue(value).slice(0, MAX_VALUE_LENGTH);
    } else if (typeof value === "number" && Number.isFinite(value)) {
      result[key] = value;
    } else if (typeof value === "boolean") {
      result[key] = value;
    } else {
      continue;
    }
    count += 1;
  }

  return count > 0 ? result : null;
}

function redactSensitiveValue(value: string): string {
  return SENSITIVE_VALUE_PATTERNS.reduce(
    (current, rule) => current.replace(rule.pattern, rule.replacement),
    value,
  );
}

/** 경로만 남기고 쿼리스트링을 버린다. 초대 토큰 등이 계측에 섞이지 않도록 한다. */
export function sanitizePath(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/")) return null;
  const [path] = raw.split(/[?#]/);
  if (path.startsWith("/board/")) return "/board/[token]";
  return path.slice(0, 300);
}

/** 유입 분석은 GA4가 담당하므로 출처 도메인만 남긴다. */
export function sanitizeReferrer(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    return new URL(raw).hostname.slice(0, 200);
  } catch {
    return null;
  }
}
