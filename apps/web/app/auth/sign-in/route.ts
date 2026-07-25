import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authEnv } from "@/lib/auth";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const { url, anonKey } = authEnv();
  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) =>
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/?login_error=1`);
  }

  return NextResponse.redirect(data.url);
}
