export const ORG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const RESERVED_ORG_SLUGS = new Set([
  "api",
  "auth",
  "board",
  "login",
  "logout",
  "new",
  "onboarding",
  "projects",
  "settings",
  "subscribe",
]);

export function normalizeOrgSlug(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9-]/g, "");
}

export function validateOrgSlug(value: string): string | null {
  const slug = normalizeOrgSlug(value);
  if (slug.length < 3) return "팀 URL은 3자 이상이어야 합니다";
  if (slug.length > 32) return "팀 URL은 32자 이하여야 합니다";
  if (!ORG_SLUG_PATTERN.test(slug)) {
    return "팀 URL은 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다";
  }
  if (RESERVED_ORG_SLUGS.has(slug)) return "사용할 수 없는 팀 URL입니다";
  return null;
}
