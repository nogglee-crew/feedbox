import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export function authEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    // Keep legacy anon JWT support during the Supabase key migration.
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      "",
  };
}

export function isAuthEnabled(): boolean {
  const { url, anonKey } = authEnv();
  return Boolean(url && anonKey);
}

/** Request-cached user from verified JWT claims. */
export const getUser = cache(async function getUser(): Promise<AuthenticatedUser | null> {
  if (!isAuthEnabled()) return null;
  const { url, anonKey } = authEnv();
  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {
        // Middleware owns refresh writes because Server Components cannot set cookies.
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
