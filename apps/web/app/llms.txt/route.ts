/**
 * AI 크롤러가 서비스 개요를 짧게 파악하도록 제공하는 요약 문서.
 * 표준은 아니지만 llmstxt.org 관례를 따른다.
 */
export const dynamic = "force-static";

export function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const body = `# FEEDBOX (피드박스)

> 웹 서비스의 버그 제보를 수집하는 QA 피드백 플랫폼. 사용자가 화면에서 문제가 된 요소를 찍고 메모를 남기면 셀렉터, 콘솔 에러, API 호출, 브라우저 환경, 스크린샷이 자동으로 첨부됩니다.

FEEDBOX는 QA 담당자나 비개발자 테스터가 재현 정보를 직접 적지 않아도 되도록 만들어졌습니다.
고객사 웹사이트에 SDK를 설치하면 우측 하단 툴바가 나타나고, 테스터는 문제가 된 요소를 클릭해 메모만 남깁니다.
수집된 이슈는 구조화된 JSON으로 복사해 코딩 에이전트에 그대로 붙여넣을 수 있습니다.

## 핵심 개념

- 프로젝트: QA 대상이 되는 웹 서비스 단위. \`projectKey\`와 \`apiKey\`가 발급됩니다.
- 릴리즈: 프로젝트의 QA 회차. 릴리즈별로 이슈가 모입니다.
- QA 세션: 테스터에게 배포하는 만료 기한이 있는 링크. 피드백 모드 URL과 이슈 보드 URL이 발급됩니다.
- 이슈 보드: 고객사가 제보 현황과 처리 상태를 열람하는 공개 페이지.

## 설치

npm 패키지 \`@nogglee/feedbox\`를 설치하고 \`FeedboxProvider\`로 앱을 감쌉니다.
피드백 모드는 URL 프래그먼트 \`#session=<token>\`으로 활성화됩니다.

## 링크

- [홈](${siteUrl}/): 서비스 소개와 설치 안내
- [데모](${siteUrl}/demo): SDK가 설치된 예시 화면. 직접 피드백을 남겨볼 수 있습니다
- [이용약관](${siteUrl}/terms)
- [개인정보처리방침](${siteUrl}/privacy)
- [GitHub](https://github.com/nogglee-crew/feedbox): 플랫폼 소스 (AGPL v3)

## 색인 제외

이슈 보드(\`/board/*\`)는 고객사의 제보 데이터를 담고 있어 크롤링 대상이 아닙니다.
대시보드(\`/:orgSlug/projects\`)는 인증이 필요합니다.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
