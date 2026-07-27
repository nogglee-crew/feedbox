import { notFound } from "next/navigation";
import { cache } from "react";
import { getUser, type AuthenticatedUser } from "./auth";

/**
 * 플랫폼 운영자 판정.
 * `Organization.accessOverride`는 조직 단위 결제 우회라 운영자 권한과 무관하다.
 * 운영자는 소수라 대시보드 접근 허용 목록과 같은 방식으로 환경변수에 둔다.
 */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = adminEmails();
  // 비어 있으면 아무도 통과시키지 않는다. 설정 누락이 전체 공개로 이어지면 안 된다.
  return allowed.length > 0 && allowed.includes(email.toLowerCase());
}

/**
 * 운영자가 아니면 404를 낸다.
 * 403은 경로의 존재를 알려주므로, 어드민 화면은 없는 것처럼 보이게 한다.
 */
export const requireAdmin = cache(async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await getUser();
  if (!user || !isAdminEmail(user.email)) notFound();
  return user;
});
