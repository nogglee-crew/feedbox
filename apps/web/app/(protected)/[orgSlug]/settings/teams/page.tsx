import Link from "next/link";
import { renameOrg } from "@/app/org-actions";
import { AvatarStack } from "@/features/organizations/components/avatar-stack";
import { OrgSlugForm } from "@/features/organizations/components/org-slug-form";
import { PlanBadge } from "@/features/billing/components/plan-badge";
import { RoleBadge } from "@/features/organizations/components/role-badge";
import { CreateTeamButton } from "@/features/organizations/components/create-team";
import { DeleteTeamButton } from "@/features/organizations/components/delete-team-button";
import { Button, buttonClasses } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hasPaidAccess } from "@/features/billing/domain/entitlements";
import { listOrgMembers, requireOrgBySlug } from "@/lib/orgs";

export const metadata = { title: "팀 관리" };

export const dynamic = "force-dynamic";

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const ctx = await requireOrgBySlug(orgSlug);
  const membersByOrg = new Map(
    await Promise.all(
      ctx.memberships.map(async ({ org }) => {
        const members = await listOrgMembers(org.id);
        return [org.id, members] as const;
      }),
    ),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">팀 관리</h1>
          <p className="mt-1 text-sm text-muted">
            내가 속한 팀 목록입니다. 프로젝트는 팀 단위로 관리되며, 소유한 팀은
            이름과 URL을 바꾸거나 멤버를 초대할 수 있습니다.
          </p>
        </div>
        <CreateTeamButton />
      </div>

      <ul className="space-y-3">
        {ctx.memberships.map(({ org, role }) => {
          const isOwner = role === "owner";
          return (
            <li key={org.id} className={cardClasses()}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{org.name}</span>
                  <PlanBadge paid={hasPaidAccess(org)} />
                  <RoleBadge role={role} />
                </div>
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${org.slug}/settings/members`}
                      className={buttonClasses("secondary", "sm")}
                    >
                      멤버 관리
                    </Link>
                    <DeleteTeamButton orgId={org.id} teamName={org.name} />
                  </div>
                )}
              </div>

              {isOwner && (
                <>
                  <form
                    action={renameOrg}
                    className="mt-4 flex items-end gap-2"
                  >
                    <input type="hidden" name="org_id" value={org.id} />
                    <Input
                      id={`rename-org-${org.id}`}
                      label="팀 이름 변경"
                      name="name"
                      defaultValue={org.name}
                      className="w-64"
                    />
                    <Button type="submit">저장</Button>
                  </form>
                  <OrgSlugForm orgId={org.id} slug={org.slug} />
                </>
              )}

              <div className="mt-4">
                <AvatarStack members={membersByOrg.get(org.id) ?? []} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
