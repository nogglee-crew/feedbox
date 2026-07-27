import type { MetadataRoute } from "next";

/**
 * 색인 제외 경로.
 * 대시보드(`/:orgSlug/projects`)는 인증이 걸려 있지만, 크롤러가 로그인 리다이렉트를
 * 반복해서 긁지 않도록 명시한다.
 */
const DISALLOW = [
  "/api/",
  "/board/",
  "/auth/",
  "/admin",
  "/onboarding",
  "/*/projects",
  "/*/settings",
];

/** 검색엔진 크롤러. `*`로도 커버되지만 주요 유입 경로라 명시한다 */
const SEARCH_BOTS = ["Yeti", "Googlebot", "bingbot"];

/**
 * 사용자 질문에 답하며 출처를 인용·링크하는 봇. 유입이 발생하므로 공개 페이지를 허용한다.
 * 학습 전용 수집기(GPTBot, CCBot 등)는 여기 없고 아래 `*` 규칙을 따른다.
 */
const AI_SEARCH_BOTS = [
  // Anthropic
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  // OpenAI
  "OAI-SearchBot",
  "ChatGPT-User",
  // Google (Gemini 인용·그라운딩)
  "Google-Extended",
  "GoogleOther",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Apple (Siri, Spotlight)
  "Applebot",
  // Meta
  "meta-externalagent",
  "meta-externalfetcher",
  // 그 외 에이전트/어시스턴트
  "Manus-User",
  "MistralAI-User",
  "DuckAssistBot",
  "Amazonbot",
  "YouBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      // robots.txt는 가장 구체적인 그룹만 적용되므로 disallow를 다시 명시해야 한다
      { userAgent: SEARCH_BOTS, allow: "/", disallow: DISALLOW },
      { userAgent: AI_SEARCH_BOTS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
