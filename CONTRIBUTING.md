# 기여 가이드

FEEDBOX에 관심 가져주셔서 감사합니다. 버그 제보와 Pull Request를 환영합니다.
SDK를 설치해서 쓰려는 분은 [`packages/sdk/README.md`](packages/sdk/README.md)를 보세요.

## 기여 방법

- **버그 제보·기능 제안** — 이슈로 남겨주세요. 재현 방법, 기대한 동작, 실제 동작을 적어주시면
  확인이 빨라집니다.
- **작은 수정** (오타, 문서, 명백한 버그) — 바로 PR을 열어주세요.
- **큰 변경** (스키마, 라우팅 구조, SDK 공개 API, 결제 로직) — 이슈로 먼저 논의해 주세요.
  방향이 어긋난 채로 작업하면 서로 손해입니다.

PR을 열기 전에 [작업 규칙](#작업-규칙)을 읽고 [검증](#검증)을 통과시켜 주세요.

기여한 코드는 저장소와 같은 라이선스로 배포됩니다 — 플랫폼은 [GNU AGPL v3](LICENSE),
`packages/sdk`는 [MIT](packages/sdk/LICENSE)입니다. SDK는 고객 애플리케이션에 설치되므로
**AGPL 코드를 SDK 쪽으로 옮기면 안 됩니다.**

## 구조

```text
apps/web/
  app/                    Next.js 화면, Route Handler, Server Action
  components/ui/          공용 UI 프리미티브
  features/<domain>/
    components/           도메인 전용 컴포넌트
    domain/               순수 정책 (프레임워크 의존 없음)
    server/               usecase와 query
  lib/                    공용 서버 컨텍스트와 인프라
  prisma/                 단일 baseline schema와 migration
packages/sdk/             @nogglee/feedbox
```

Supabase가 Auth, PostgreSQL, Storage를 제공하고 서비스 데이터는 Prisma로 접근합니다.
Vercel runtime은 pooled `DATABASE_URL`을, Prisma Migrate는 `DIRECT_URL`을 사용합니다.

## 로컬 설정

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm --filter web db:deploy       # 마이그레이션 적용
pnpm --filter web setup:storage   # screenshots 버킷 생성
pnpm dev
```

Supabase Google Auth의 redirect allow list에 `http://localhost:3000/auth/callback`과
운영 도메인의 `/auth/callback`을 등록합니다.

## 작업 규칙

코드를 고치기 전에 읽어야 하는 문서입니다.

| 문서 | 내용 |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | 레이어 경계, 인증·소유권 검증, 변경 범위 규칙 |
| [`DESIGN.md`](DESIGN.md) | 디자인 토큰, 컴포넌트 배치, 아이콘, 상호작용 규칙 |

핵심만 옮기면:

- `app/`은 전송과 Next.js 제어만, 도메인 정책은 `features/`에 둡니다.
- 쓰기는 인증·활성 팀·리소스 소유권을 검증하는 usecase를 반드시 거칩니다.
- 클라이언트가 보낸 ID는 신뢰하지 않고 usecase에서 소유권을 다시 확인합니다.
- 색은 `app/globals.css`에 정의한 시맨틱 토큰만 씁니다. Tailwind 기본 팔레트는
  `--color-*: initial`로 차단돼 있어 `gray-500` 같은 클래스는 아무것도 생성하지 않습니다.
- 스키마를 바꿀 때는 `schema.prisma`와 마이그레이션을 함께 커밋합니다.
- 생성된 Prisma 클라이언트(`lib/generated/`)는 수정하거나 커밋하지 않습니다.

## 검증

`pnpm install` 시 `.githooks`가 연결되어 커밋 전에 자동으로 돌아갑니다. PR을 열기 전에
직접 한 번 더 확인해 주세요.

```bash
pnpm check:conventions            # 아키텍처 규칙
pnpm --filter web exec prisma validate
pnpm typecheck
pnpm build                        # SDK → web 순서로 빌드
```

Tailwind 클래스는 타입 검사에 걸리지 않고 **조용히 사라집니다.** 오타가 나거나 정의되지
않은 토큰을 쓰면 스타일만 빠진 채 빌드가 통과하므로, 새 클래스를 쓸 때는 실제로 CSS가
생성되는지 확인하는 편이 안전합니다.

## 데이터베이스

```bash
pnpm --filter web db:migrate      # 개발용 마이그레이션 생성
pnpm --filter web db:deploy       # 기존 마이그레이션 적용
pnpm --filter web db:studio       # Prisma Studio
```

결제 상태는 **팀(Organization) 단위**입니다.

- 일반 결제 팀: `billingStatus`가 `TRIALING` 또는 `ACTIVE`
- 관리자 제공 계정: `accessOverride=ADMIN`
- 테스트 계정: `accessOverride=TEST`
- 무료 팀: 위 조건이 없으며 프로젝트 1개 제한

override 변경은 Prisma Studio에서 할 수 있습니다.

## 배포

1. 새 Supabase 프로젝트를 만들고 Auth, Database, Storage 환경변수를 준비합니다.
2. Vercel에 `apps/web/.env.example`의 runtime 변수를 등록합니다. `NEXT_PUBLIC_SITE_URL`은
   OG 절대 URL과 sitemap에 쓰이므로 반드시 배포 도메인으로 지정합니다.
3. GitHub `production` environment에 `DIRECT_URL`, Supabase URL/secret을 등록합니다.
4. `Migrate Production Database` workflow를 한 번 실행합니다.
5. Vercel에서 monorepo root를 연결하고 Build Command를 `pnpm build`로 설정합니다.

### SDK 배포

npm 장기 토큰을 쓰지 않습니다. npm의 `@nogglee/feedbox` 패키지 설정에서 GitHub Actions
Trusted Publisher를 `publish-sdk.yml`에 연결한 뒤, `sdk-v0.1.0` 형식의 태그를 push하면
OIDC로 배포됩니다.

SDK는 고객 애플리케이션에 설치되므로 **호환성을 깨는 변경은 사전 합의와 릴리즈 계획이
필요합니다.** `FeedboxProvider`의 props, `#session=` 규약, `/api/sdk/*` 응답 형태가
여기에 해당합니다.
