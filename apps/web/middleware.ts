import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Tester-facing and authentication routes bypass dashboard auth.
const PUBLIC_PATHS = [
  // 랜딩. 로그인 여부 분기는 페이지가 직접 한다
  /^\/$/,
  /^\/auth\/sign-in/,
  /^\/auth\//,
  /^\/api\/sdk\//,
  // 랜딩과 공개 보드에서도 계측을 보낸다. 인증을 요구하면 비로그인 이벤트가 전부 유실된다
  /^\/api\/events$/,
  /^\/demo/,
  /^\/board\//,
  /^\/terms/,
  /^\/privacy/,
  // 업데이트 소식 — 비로그인 방문자도 랜딩에서 들어온다
  /^\/changelog$/,
];

export async function middleware(request: NextRequest) {
  if (PUBLIC_PATHS.some((re) => re.test(request.nextUrl.pathname))) return NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !publishableKey) {
    return NextResponse.json({ error: "Supabase Auth is not configured" }, { status: 500 });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims.sub) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/sign-in";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // 정적 에셋과 SEO 파일은 인증 검사 없이 통과시킨다
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|llms\\.txt|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)).*)",
  ],
};
