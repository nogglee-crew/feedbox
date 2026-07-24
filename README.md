# FEEDBOX

웹 서비스 화면 위에서 피드백을 남기고, 릴리즈별 이슈를 관리하는 Next.js 애플리케이션과 React SDK입니다.

## Structure

```text
apps/web/
  app/                    Next.js 화면, Route Handler, Server Action
  features/               도메인 정책과 server usecase
  lib/store/              SDK API용 repository interface/Prisma adapter
  prisma/                 단일 baseline schema와 migration
packages/sdk/             @nogglee/feedbox
```

Supabase는 Auth, PostgreSQL, Storage를 제공하고 서비스 데이터는 Prisma로 접근합니다. Vercel runtime은 pooled `DATABASE_URL`을, Prisma Migrate는 `DIRECT_URL`을 사용합니다.

## Local setup

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm --filter web db:deploy
pnpm --filter web setup:storage
pnpm dev
```

Supabase Google Auth의 redirect allow list에는 `http://localhost:3000/auth/callback`과 운영 FEEDBOX 도메인의 `/auth/callback`을 등록합니다.

## SDK

```bash
npm install @nogglee/feedbox
```

```tsx
import { FeedboxProvider } from "@nogglee/feedbox";

export function App() {
  return (
    <FeedboxProvider
      projectKey="project-key"
      apiKey="project-api-key"
      apiBaseUrl="https://feedbox.example.com"
    >
      <YourApp />
    </FeedboxProvider>
  );
}
```

대시보드에서 발급한 링크는 `https://service.example.com#session=<token>` 형식입니다. SDK가 fragment의 세션을 검증한 뒤 `sessionStorage`에 유지합니다.

## Billing access

결제 상태는 조직에 귀속됩니다.

- 일반 결제 조직: `billingStatus`가 `TRIALING` 또는 `ACTIVE`
- 관리자 제공 계정: `accessOverride=ADMIN`
- 테스트 계정: `accessOverride=TEST`
- 무료 조직: 위 조건이 없으며 프로젝트 1개 제한

운영자가 override를 변경할 때는 Prisma Studio를 사용할 수 있습니다.

```bash
pnpm --filter web db:studio
```

## Deployment

1. 새 Supabase 프로젝트를 만들고 Auth, Database, Storage 환경변수를 준비합니다.
2. Vercel에 `apps/web/.env.example`의 runtime 변수를 등록합니다.
3. GitHub `production` environment에 `DIRECT_URL`, Supabase URL/secret을 등록합니다.
4. `Migrate Production Database` workflow를 한 번 실행합니다.
5. Vercel에서 monorepo root를 연결하고 Build Command를 `pnpm build`로 설정합니다.

SDK는 npm 장기 토큰을 사용하지 않습니다. npm의 `@nogglee/feedbox` 패키지 설정에서 GitHub Actions Trusted Publisher를 `publish-sdk.yml`에 연결한 후 `sdk-v0.1.0` 형식의 태그를 push하면 OIDC로 배포됩니다.
