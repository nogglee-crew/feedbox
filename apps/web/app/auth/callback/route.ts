import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { resolveOrganizationAfterSignIn } from "@/features/organizations/server/use-cases";
import { authEnv } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/`);
  }

  {
    const { url, anonKey } = authEnv();
    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    });
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user.email) {
      return NextResponse.redirect(`${origin}/?login_error=1`);
    }

    const org = await resolveOrganizationAfterSignIn({
      authUserId: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata.name,
      avatarUrl: data.user.user_metadata.avatar_url,
    });

    if (!org) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    return NextResponse.redirect(`${origin}/${org.slug}/projects`);
  }
}
