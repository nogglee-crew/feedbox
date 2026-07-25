import Image from "next/image";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";
import { buildInstallPrompt } from "@/lib/install-prompt";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, cardClasses } from "@/components/ui/card";
import { Code } from "@/components/ui/code";
import { CopyButton } from "@/components/ui/copy-button";
import { SiteFooter } from "@/components/site-footer";
import { FeatureCard } from "@/features/landing/components/feature-card";
import { HeroDemo } from "@/features/landing/components/hero-demo";
import { Reveal } from "@/features/landing/components/reveal";
import { TrackedLink } from "@/features/landing/components/tracked-link";

function SectionHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{sub}</p>
    </div>
  );
}

/** 상시 공개 데모 세션. 토큰이 있어야 SDK 툴바가 뜬다 */
const DEMO_URL = "/demo#session=Z72AGKeihOspaMRN3NoNqi8iaVfhtajh";

const INSTALL_PROMPT = buildInstallPrompt();

const FEATURES = [
  {
    vignette: "aim" as const,
    title: "요소 지정 피드백",
    body: "사용자가 화면에서 문제가 된 요소를 직접 찍고 메모를 남깁니다. ESC 한 번으로 피드백 모드를 켜고 끕니다.",
  },
  {
    vignette: "diagnostics" as const,
    title: "자동 진단 수집",
    body: "셀렉터, 요소 텍스트, 에러, 실패한 API 호출, 해상도·브라우저 정보를 이슈에 자동 첨부합니다.",
  },
  {
    vignette: "capture" as const,
    title: "스크린샷 첨부",
    body: "제보 시점의 화면을 자동 캡처합니다. 목록에서는 미리보기로, 원본은 클릭 한 번으로 확인합니다.",
  },
  {
    vignette: "board" as const,
    title: "이슈 보드",
    body: "로그인 없이 링크로 여는 처리 현황판입니다. 고객이 직접 내용을 수정하고, 처리 완료를 확인합니다.",
  },
  {
    vignette: "triage" as const,
    title: "이슈 관리",
    body: "상태와 담당자를 지정하고, 메모·URL·에러 내용으로 검색하고 상태로 거릅니다.",
  },
  {
    vignette: "clipboard" as const,
    title: "에이전트에 바로 붙여넣기",
    body: "이슈를 재현 정보가 담긴 구조화된 JSON으로 복사합니다. 코딩 에이전트에 붙여넣으면 그대로 수정 작업이 시작됩니다.",
  },
];

const UPCOMING = [
  {
    title: "이슈 접수 알림 · GitHub 연동",
    body: "이슈가 접수되면 팀 멤버에게 알리고, 연결한 GitHub 저장소에 이슈로 발행합니다.",
  },
  {
    title: "Slack · Discord 연동",
    body: "접수와 상태 변경 이벤트를 팀이 쓰는 채널로 보내는 API를 제공합니다.",
  },
  {
    title: "중복 이슈 감지",
    body: "접수 순간 비슷한 이슈를 찾아 알려줍니다. 테스터 다섯 명이 같은 버그를 다섯 번 등록하는 일이 사라집니다.",
  },
];

const AUDIENCES = [
  {
    name: "SI · 에이전시",
    claim: "검수 커뮤니케이션 비용을 줄입니다",
    body: "카톡과 엑셀로 오가던 검수 피드백이 재현 정보가 갖춰진 이슈로 도착합니다. 되묻는 왕복이 사라집니다.",
    customerLead: "고객사는",
    customer:
      " 설치·로그인 없이 링크 하나로 참여하고, 이슈 보드에서 처리 현황을 투명하게 확인합니다.",
  },
  {
    name: "사내 툴 · ERP",
    claim: "비개발자 제보가 재현 가능한 티켓이 됩니다",
    body: "AI로 빠르게 만든 툴일수록 버그 제보 창구가 필요합니다. 에러와 환경 정보는 SDK가 대신 수집합니다.",
    customerLead: "현업 직원은",
    customer: " 쓰던 화면에서 문제가 된 곳을 찍고 메모만 남기면 됩니다.",
  },
  {
    name: "사이드 프로젝트",
    claim: "QA 체계를 10분 만에",
    body: "SDK 몇 줄을 붙이고 지인 테스터에게 링크만 보내세요. 무료로 시작합니다.",
    customerLead: "테스터는",
    customer: " 앱 설치도 계정도 없이, 보이는 화면에서 바로 피드백을 남깁니다.",
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "FEEDBOX",
      url: SITE_URL,
      logo: `${SITE_URL}/feedbox-logo.png`,
      sameAs: ["https://github.com/nogglee-crew/feedbox"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "FEEDBOX",
      alternateName: "피드박스",
      url: SITE_URL,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      inLanguage: "ko",
      description:
        "FEEDBOX(피드박스)는 웹 서비스의 버그 제보를 수집하는 QA 피드백 플랫폼입니다. 사용자가 화면에서 문제가 된 요소를 찍고 메모를 남기면 셀렉터, 에러, API 호출, 브라우저 환경, 스크린샷이 자동으로 첨부됩니다.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    },
  ],
};

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/60 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
          <Image
            src="/feedbox-logo.png"
            alt="FEEDBOX"
            width={1468}
            height={284}
            priority
            className="h-6 w-auto"
          />
          <TrackedLink
            href="/auth/sign-in"
            event="cta_signin_click"
            eventParams={{ location: "header" }}
            className={buttonClasses("secondary", "sm")}
          >
            로그인
          </TrackedLink>
        </div>
      </header>

      <main className="flex-1">
        {/* 히어로 */}
        <section className="mx-auto grid w-full max-w-5xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="space-y-6">
            <p className="text-sm font-semibold text-muted">
              <span className="text-foreground">FEEDBOX</span> · 웹 QA 피드백 플랫폼
            </p>
            <h1 className="text-4xl font-extrabold leading-tight">
              버그 제보를 받는
              <br />
              가장 짧은 경로
            </h1>
            <p className="max-w-md text-base text-muted">
              화면에서 문제가 된 곳을 찍고 메모를 남겨보세요.
              <br />
              셀렉터, 에러, API 호출, 브라우저 환경, 스크린샷까지
              <br />
              피드박스가 자동으로 수집해드릴게요.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <TrackedLink
                href="/auth/sign-in"
                event="cta_signin_click"
                eventParams={{ location: "hero" }}
                className={buttonClasses("primary")}
              >
                구글 계정으로 시작하기
              </TrackedLink>
              <TrackedLink
                href={DEMO_URL}
                event="demo_click"
                className={buttonClasses("secondary")}
              >
                데모 체험하기
              </TrackedLink>
            </div>
          </div>

          <HeroDemo />
        </section>

        {/* 문제 공감 */}
        <section className="bg-surface">
          <Reveal className="mx-auto w-full max-w-5xl space-y-10 px-6 py-16 lg:py-20">
            <SectionHeading
              title="이런 제보, 익숙하지 않으세요?"
              sub="재현 정보를 받아내기 위한 소통이 시간이 개발 시간보다 오래 걸립니다."
            />
            <div className="grid items-start gap-8 lg:grid-cols-2">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Tag>as-is</Tag>
                  <span className="text-xs text-subtle">
                    지금까지의 버그 제보
                  </span>
                </div>
                <div className="max-w-xs rounded-2xl rounded-bl-md bg-surface-muted px-4 py-2.5">
                  저기 버튼이 안 눌려요 ㅠㅠ
                </div>
                <div className="ml-auto max-w-xs rounded-2xl rounded-br-md border border-border px-4 py-2.5">
                  어떤 화면에서요? 브라우저는 뭐 쓰세요? 스크린샷 한 장만
                  부탁드려요.
                </div>
                <div className="max-w-xs rounded-2xl rounded-bl-md bg-surface-muted px-4 py-2.5">
                  그냥 안 되는데요… 캡처는 이따가 보내드릴게요.
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag tone="primary">to-be</Tag>
                  <span className="text-xs text-subtle">
                    FEEDBOX로 도착한 같은 제보
                  </span>
                </div>
                <div className={cardClasses()}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">#13</span>
                    <StatusBadge tone="danger" emphasis>
                      접수됨
                    </StatusBadge>
                    <span className="text-xs text-subtle">
                      2026. 7. 25. PM 12:37
                    </span>
                  </div>
                  <p className="mt-3 text-sm">
                    가입 버튼을 눌러도 반응이 없어요
                  </p>
                  <dl className="mt-3 grid grid-cols-[max-content_1fr] items-baseline gap-x-3 gap-y-1.5 text-xs">
                    <dt className="font-semibold text-subtle">요소</dt>
                    <dd>
                      <Code>main &gt; form &gt; button</Code>
                    </dd>
                    <dt className="font-semibold text-subtle">에러</dt>
                    <dd className="space-x-1.5">
                      <Code>HttpError</Code>
                      <Code>HTTP_500</Code>
                    </dd>
                    <dt className="font-semibold text-subtle">호출 API</dt>
                    <dd>
                      <Code>POST /api/signup → 500</Code>
                    </dd>
                    <dt className="font-semibold text-subtle">환경</dt>
                    <dd className="space-x-1.5">
                      <Code>1920×929</Code>
                      <Code>Chrome 150 · macOS</Code>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* 설치 프롬프트 */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-20">
          <Reveal className="space-y-10">
            <SectionHeading
              title="설치는 프롬프트 한 장"
              sub="코딩 에이전트에 아래 프롬프트를 붙여넣으면 SDK 설치부터 Provider 적용까지 한 번에 끝납니다."
            />
            <div className={cardClasses("none")}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
                <span className="text-xs font-semibold text-muted">
                  코딩 에이전트에 붙여넣으세요
                </span>
                <span className="flex items-center gap-1.5">
                  <CopyButton
                    value={INSTALL_PROMPT}
                    label="프롬프트 복사"
                    variant="secondary"
                    event="install_prompt_copy"
                    eventParams={{ location: "landing" }}
                  />
                  <TrackedLink
                    href="https://github.com/nogglee-crew/feedbox"
                    event="github_click"
                    external
                    className={buttonClasses("ghost", "sm")}
                  >
                    <HiArrowTopRightOnSquare aria-hidden className="size-3.5" />
                    GitHub
                  </TrackedLink>
                </span>
              </div>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap p-5 font-mono text-xs leading-relaxed text-muted">
                {INSTALL_PROMPT}
              </pre>
            </div>
            <p className="text-xs text-subtle">
              projectKey·apiKey는 대시보드의 SDK 설치 정보에서 복사해 채워
              넣으면 됩니다.
            </p>
          </Reveal>
        </section>

        {/* 핵심 기능 */}
        <section className="bg-surface">
          <Reveal className="mx-auto w-full max-w-5xl space-y-10 px-6 py-16 lg:py-20">
            <SectionHeading
              title="지금 바로 쓸 수 있는 것들"
              sub="피드백 수집부터 처리 공유까지, QA에 필요한 최소한을 갖췄습니다."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </Reveal>
        </section>

        {/* 커밍순 */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-20">
          <Reveal className="space-y-10">
            <SectionHeading
              title="다음 업데이트"
              sub="접수된 이슈가 팀의 도구까지 알아서 흘러가도록 준비하고 있습니다."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {UPCOMING.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-dashed border-border-strong p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <Tag className="shrink-0">준비 중</Tag>
                  </div>
                  <p className="mt-1.5 text-sm text-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 타겟별 가치 */}
        <section className="bg-surface">
          <Reveal className="mx-auto w-full max-w-5xl space-y-10 px-6 py-16 lg:py-20">
            <SectionHeading
              title="누구의 하루가 줄어드나요"
              sub="피드백을 주는 사람과 받는 사람, 양쪽의 시간을 아낍니다."
            />
            <div className="grid items-stretch gap-4 lg:grid-cols-3">
              {AUDIENCES.map((audience) => (
                <div key={audience.name} className="flex flex-col gap-2">
                  <Card padding="lg" className="flex-1 space-y-3">
                    <Tag>{audience.name}</Tag>
                    <h3 className="text-base font-bold">{audience.claim}</h3>
                    <p className="text-sm text-muted">{audience.body}</p>
                  </Card>
                  {/* 고객의 고객. 한 톤 진한 면으로 시선의 순서를 만든다 */}
                  <div className="rounded-xl border border-border bg-surface-muted p-5">
                    <p className="text-sm text-muted">
                      <span className="font-semibold text-foreground">
                        {audience.customerLead}
                      </span>
                      {audience.customer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 마지막 CTA — 페이지의 유일한 색 면. 버튼은 반전으로 */}
        <section className="bg-surface">
          <Reveal className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-20">
            <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center lg:py-20">
              {/* 커서가 요소를 조준하는 히어로의 장면을 배경 그래픽으로 되풀이한다 */}
              <span
                aria-hidden
                className="pointer-events-none absolute -left-10 -top-10 size-48 rounded-full border border-on-primary/15"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -right-8 size-56 rounded-full border border-on-primary/15"
              />
              <span
                aria-hidden
                className="fx-ring pointer-events-none absolute right-16 top-12 size-10 rounded-lg border-2 border-on-primary/40"
              />
              <span
                aria-hidden
                className="fx-ring fx-d2 pointer-events-none absolute bottom-12 left-16 size-8 rounded-lg border-2 border-on-primary/40"
              />
              <h2 className="relative text-2xl font-bold text-on-primary">
                설치부터 피드백까지 5분
              </h2>
              <p className="relative mt-2 text-sm text-brand-200">
                프롬프트 한 장 붙여넣으면 설치는 끝
              </p>
              <div className="relative mt-6 flex justify-center">
                <TrackedLink
                  href="/auth/sign-in"
                  event="cta_signin_click"
                  eventParams={{ location: "footer" }}
                  className="inline-flex items-center justify-center rounded-md bg-surface px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  구글 계정으로 시작하기
                </TrackedLink>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
