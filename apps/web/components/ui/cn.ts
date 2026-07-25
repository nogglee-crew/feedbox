/** variant가 닫혀 있으므로 caller의 className은 레이아웃 용도로만 쓴다 (충돌 유틸리티의 override는 보장하지 않는다) */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
