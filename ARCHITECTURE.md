# Architecture

FEEDBOX is a Next.js full-stack modular monolith. FSD guides feature placement; DDD-lite separates server policy, usecases, and infrastructure. Split services only when runtime or team boundaries require it.

## System Boundary

FEEDBOX owns:

- dashboard authentication and organization access
- organization billing entitlements
- projects, releases, QA sessions, and issues
- SDK session verification and issue submission
- screenshots and public QA boards

External systems:

- Supabase: Auth, PostgreSQL, Storage
- Vercel: Next.js runtime
- npm: `@nogglee/feedbox`
- customer apps: SDK hosts

## Runtime

```text
Dashboard -> middleware/getClaims -> Server Component or Action
          -> feature usecase/query -> Prisma -> Supabase PostgreSQL

Customer app + SDK -> /api/sdk/* -> capability check
                   -> Prisma / Supabase Storage
```

Server code accesses queries/repositories directly; it does not call internal Route Handlers over HTTP.

## Monorepo

```text
apps/web/
  app/          Next.js routes, layouts, actions, route handlers
  features/     domain policy, usecases, feature queries/UI
  lib/          auth, organization context, DB/storage infrastructure
  prisma/       schema and migrations

packages/sdk/   published React SDK
```

Dependency direction:

```text
app/components -> feature usecase/query -> domain policy
               -> repository/infrastructure -> Prisma/Supabase
```

Rules:

- `app/` handles transport, parsing, redirect/notFound/revalidation.
- Mutations and state transitions belong in feature usecases.
- Pure rules belong in `features/<domain>/domain`.
- Feature reads belong in queries/repositories.
- `lib/store` is transitional; do not grow it into a catch-all service.
- Domain code must not import Next.js, React, Prisma, or Supabase.
- Prisma/server secrets must never enter Client Components.

## Auth and Access

- Supabase JWT claims are the dashboard auth source of truth.
- Middleware verifies/refreshes protected requests with `getClaims()`.
- `getUser()` and `loadOrgContext()` are request-cached deduplication, not global caches.
- Client auth stores cannot authorize server work.
- Organization mutations call `requireOrg()` and verify resource ownership.
- Owner-only operations use `assertOwner()`.
- Never trust client-provided organization or resource IDs.

SDK auth is separate from dashboard auth. A request requires `projectKey`, `apiKey`, and session `token`; the session must belong to the project, be active, and target an `OPEN` release.

## Data and Billing

```text
Organization
  ├─ OrganizationMember
  └─ Project
       ├─ Release
       ├─ QaSession
       └─ Issue
```

- Every project belongs to one organization.
- Release/session/issue ownership resolves through project.
- Billing belongs to organization, not user.
- Paid access is `PRO + TRIALING|ACTIVE`, or `ADMIN|TEST` override.
- Use billing domain policies; do not duplicate entitlement checks.
- Multi-record invariants belong in usecase transactions.

`prisma/schema.prisma` is the application data source of truth. Runtime uses pooled `DATABASE_URL`; migrations use direct `DIRECT_URL`. Supabase JS does not query application tables. Generated Prisma client files are not edited or committed.

## SDK Contract

- package: `@nogglee/feedbox`
- provider: `FeedboxProvider`
- link: `#session=<token>`
- API: `/api/sdk/sessions/verify`, `/api/sdk/issues`

The fragment keeps the token out of the initial HTTP request. The project API key is public client configuration; the session token is the capability. Keep Prisma models separate from public SDK response types.
The SDK attaches recent runtime errors and failed request metadata to issues, excluding query strings, headers, and bodies.

## Decisions

- Organize by business domain, not route.
- Keep routes/actions thin and usecases authoritative.
- Verify permissions at the mutation boundary.
- Prefer direct server reads over internal HTTP.
- Add abstractions only for real boundaries or repeated rules.
- Add a queue/worker only for retries, scheduling, or long-running work.
- Extract `features/*/domain`, `features/*/server`, and repositories first if a separate backend becomes necessary; NestJS is the default candidate.
