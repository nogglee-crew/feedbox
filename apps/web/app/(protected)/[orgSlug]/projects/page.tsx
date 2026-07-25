import Link from "next/link";
import { HiChevronRight } from "react-icons/hi2";
import { createProject } from "@/app/actions";
import { SubscribeUpsell } from "@/features/billing/components/subscribe-upsell";
import { TeamSwitcher } from "@/features/organizations/components/team-switcher";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  hasPaidAccess,
  projectLimit,
} from "@/features/billing/domain/entitlements";
import { hasSubscriptionInterest } from "@/features/billing/server/subscription-interest";
import { listProjectsWithActivity } from "@/features/projects/server/queries";
import { AvatarStack } from "@/features/organizations/components/avatar-stack";
import { listOrgMembers, requireOrgBySlug } from "@/lib/orgs";

export const metadata = { title: "프로젝트" };

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const ctx = await requireOrgBySlug(orgSlug);
  if (!ctx) throw new Error("Supabase Auth 환경변수가 필요합니다");
  const [projects, members] = await Promise.all([
    listProjectsWithActivity(ctx.org.id),
    listOrgMembers(ctx.org.id),
  ]);

  const limitReached = projects.length >= projectLimit(ctx.org);
  const subscribeRequested = limitReached
    ? await hasSubscriptionInterest(ctx.email)
    : false;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TeamSwitcher
          teams={ctx.memberships.map(({ org, role }) => ({
            id: org.id,
            slug: org.slug,
            name: org.name,
            paid: hasPaidAccess(org),
            role,
          }))}
          activeId={ctx.org.id}
        />
        <AvatarStack members={members} />
      </div>

      {limitReached ? (
        <SubscribeUpsell
          email={ctx.email}
          orgId={ctx.org.id}
          requested={subscribeRequested}
        />
      ) : (
        <form
          action={createProject}
          className={`${cardClasses("sm")} flex flex-wrap items-end gap-3`}
        >
          <input type="hidden" name="org_slug" value={ctx.org.slug} />
          <Input
            label="프로젝트 이름"
            name="name"
            required
            placeholder="예: ATOZ ERP"
          />
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

      <section className="space-y-3">
        <h2 className="text-lg font-bold">프로젝트 목록</h2>
        <ul className={`${cardClasses("none")} divide-y divide-border`}>
          {(projects ?? []).map((p) => (
            <li key={p.id}>
              <Link
                href={`/${ctx.org.slug}/projects/${p.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-surface-hover"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{p.name}</span>
                    {p.latest_release_version && (
                      <Tag>{p.latest_release_version}</Tag>
                    )}
                    {p.open_issue_count > 0 && (
                      <StatusBadge tone="danger" emphasis>
                        미처리 {p.open_issue_count}건
                      </StatusBadge>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted">
                    {p.base_url ?? "서비스 URL 미설정"}
                  </div>
                </div>
                <HiChevronRight
                  aria-hidden
                  className="size-4 shrink-0 text-subtle"
                />
              </Link>
            </li>
          ))}
          {(!projects || projects.length === 0) && (
            <EmptyState>아직 프로젝트가 없습니다.</EmptyState>
          )}
        </ul>
      </section>
    </div>
  );
}
