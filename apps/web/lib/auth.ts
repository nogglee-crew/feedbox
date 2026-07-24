import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export interface AuthenticatedUser {
  id: string;
  email: string;
  /** Google 계정 이름 (없으면 null) */
  name: string | null;
  /** Google 프로필 사진 URL (없으면 null) */
  avatarUrl: string | null;
}

export function authEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    // 새 키 체계(sb_publishable_...) 우선, 레거시 anon JWT도 허용
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      "",
  };
}

/** Supabase Auth 환경변수가 모두 설정되어 있는지 */
export function isAuthEnabled(): boolean {
  const { url, anonKey } = authEnv();
  return Boolean(url && anonKey);
}

/** 검증된 JWT claims에서 읽은 현재 사용자. 동일 요청 안에서는 한 번만 실행된다. */
export const getUser = cache(async function getUser(): Promise<AuthenticatedUser | null> {
  if (!isAuthEnabled()) return null;
  const { url, anonKey } = authEnv();
  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {
        // 서버 컴포넌트는 쿠키를 쓸 수 없다. middleware가 먼저 갱신한다.
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims();
  if (error) return null;

  const id = data?.claims.sub;
  const email = data?.claims.email;
  if (typeof id !== "string" || typeof email !== "string") return null;

  const meta = (data?.claims.user_metadata ?? {}) as Record<string, unknown>;
  const pick = (...keys: string[]): string | null => {
    for (const key of keys) {
      const value = meta[key];
      if (typeof value === "string" && value) return value;
    }
    return null;
  };
  return {
    id,
    email,
    name: pick("full_name", "name"),
    avatarUrl: pick("avatar_url", "picture"),
  };
});
