import Link from "next/link";
import { HiChevronRight } from "react-icons/hi2";
import { createProject } from "@/app/actions";
import { SubscribeUpsell } from "@/features/billing/components/subscribe-upsell";
import { TeamSwitcher } from "@/features/organizations/components/team-switcher";
import { Button } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { Code } from "@/components/ui/code";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { hasPaidAccess, projectLimit } from "@/features/billing/domain/entitlements";
import { hasSubscriptionInterest } from "@/features/billing/server/subscription-interest";
import { listProjectsForOrg } from "@/features/projects/server/queries";
import { requireOrg } from "@/lib/orgs";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const ctx = await requireOrg();
  if (!ctx) throw new Error("Supabase Auth 환경변수가 필요합니다");
  const projects = await listProjectsForOrg(ctx.org.id);

  const limitReached = projects.length >= projectLimit(ctx.org);
  const subscribeRequested = limitReached
    ? await hasSubscriptionInterest(ctx.email)
    : false;

  return (
    <div className="space-y-8">
      <div>
        <TeamSwitcher
          teams={ctx.memberships.map(({ org, role }) => ({
            id: org.id,
            name: org.name,
            paid: hasPaidAccess(org),
            role,
          }))}
          activeId={ctx.org.id}
        />
        <p className="mt-1 text-sm text-muted">
          이 팀의 프로젝트 목록입니다. SDK를 설치할 웹 서비스 단위로 프로젝트를 만듭니다.
        </p>
      </div>

      {limitReached ? (
        <SubscribeUpsell email={ctx.email} orgId={ctx.org.id} requested={subscribeRequested} />
      ) : (
        <form action={createProject} className={`${cardClasses("sm")} flex flex-wrap items-end gap-3`}>
          <Input label="프로젝트 이름" name="name" required placeholder="예: ATOZ ERP" />
          <Input
            label="서비스 URL (QA 링크 생성용, 선택)"
            name="base_url"
            placeholder="https://staging.company.com"
            className="w-72"
          />
          <Button type="submit" variant="primary">
            프로젝트 생성
          </Button>
        </form>
      )}

      <ul className={`${cardClasses("none")} divide-y divide-border`}>
        {(projects ?? []).map((p) => (
          <li key={p.id}>
            <Link
              href={`/projects/${p.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-surface-hover"
            >
              <div className="min-w-0">
                <div className="font-semibold">{p.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                  key: <Code>{p.project_key}</Code>
                  {p.base_url && <span className="truncate">· {p.base_url}</span>}
                </div>
              </div>
              <HiChevronRight aria-hidden className="size-4 shrink-0 text-subtle" />
            </Link>
          </li>
        ))}
        {(!projects || projects.length === 0) && <EmptyState>아직 프로젝트가 없습니다.</EmptyState>}
      </ul>
    </div>
  );
}
