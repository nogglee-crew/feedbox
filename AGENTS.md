# AGENTS.md

Guidelines for agents working in FEEDBOX. Favor caution over speed, but use judgment for trivial tasks.

## Start Here

1. Confirm the task and success criteria.
2. Read `ARCHITECTURE.md` for structural, auth, database, SDK, or deployment work.
3. Read `DESIGN.md` for UI, component, or styling work.
4. Inspect `git status`; preserve changes you did not create.
5. Read only task-relevant files before editing.
6. Plan briefly when work has multiple dependent steps.

Project invariants:

- `apps/web/app`: transport and Next.js control only.
- `apps/web/features`: domain policy, usecases, feature queries/UI.
- `apps/web/lib`: shared server context and infrastructure.
- Writes must pass through a usecase that verifies auth, active organization, and resource ownership.
- Client auth state is never authoritative; use Supabase claims and request-cached server context.
- Prisma is the source of truth for application tables. Supabase JS is used for Auth and Storage.
- Do not edit or commit generated Prisma client files.
- SDK contract: `@nogglee/feedbox`, `FeedboxProvider`, `#session=<token>`, `/api/sdk/*`.
- Never print secrets or run destructive DB/Git/deployment actions without confirming the target.

## 1. Think Before Coding

Do not assume or hide uncertainty.

- Identify the domain and correct layer before implementing.
- Surface materially different interpretations and tradeoffs.
- Check auth, organization ownership, billing, migration, and SDK compatibility impact.
- Ask only when missing context changes the implementation or risks irreversible action.
- Push back when a simpler or safer approach satisfies the request.

## 2. Simplicity First

Write the minimum code that completely solves the task.

- No unrequested features or speculative configuration.
- No abstraction for one simple use.
- No new package merely because code may be shared later.
- Do not expand global action files or `lib/store` when a feature can own the code.
- Keep domain code free of Next.js, Prisma, Supabase, and React.
- Server code reads repositories/queries directly; it does not call its own Route Handlers over HTTP.

If the solution is much larger than expected, re-evaluate the boundary.

## 3. Surgical Changes

Touch only files required by the task.

- Match existing style and naming.
- Keep comments only when they explain non-obvious intent or constraints; do not narrate code or leave verbose explanations.
- Do not refactor, format, delete, stage, or commit unrelated work.
- Remove only code made obsolete by your changes.
- Treat client-provided IDs as untrusted and re-check ownership in mutation usecases.
- Keep secrets and server-only clients out of Client Components.
- Schema changes require both `schema.prisma` and a migration.
- Breaking SDK changes require explicit approval and a release plan.

Every changed line should trace to the request or repository validity.

## 4. Goal-Driven Execution

Define verifiable outcomes and loop until they pass.

```text
1. Make the focused change -> verify the affected behavior
2. Check integration boundaries -> verify auth/data/SDK impact
3. Run proportional validation -> report anything not verified
```

The pre-commit hook enforces architecture conventions, Prisma validation, and typechecking. CI repeats these checks and owns the production build. Run additional focused checks only when the task requires them; do not bypass hooks to hide failures.
Database commands require the correct `DATABASE_URL`/`DIRECT_URL`; never claim migration or deployment success without executing it against the intended environment.
