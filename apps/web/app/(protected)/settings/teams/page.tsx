import Link from "next/link";
import { renameOrg } from "@/app/org-actions";
import { AvatarStack } from "@/features/organizations/components/avatar-stack";
import { PlanBadge } from "@/features/billing/components/plan-badge";
import { RoleBadge } from "@/features/organizations/components/role-badge";
import { CreateTeamButton } from "@/features/organizations/components/create-team";
import { Button, buttonClasses } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hasPaidAccess } from "@/features/billing/domain/entitlements";
import { listOrgMembers, requireOrg } from "@/lib/orgs";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const ctx = await requireOrg();
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
            새 팀을 만들고, 팀 이름과 멤버를 관리합니다.
          </p>
        </div>
        <CreateTeamButton />
      </div>

      <ul className="space-y-3">
        {ctx.memberships.map(({ org, role }) => {
          const isActive = org.id === ctx.org.id;
          const isOwner = role === "owner";
          return (
            <li key={org.id} className={cardClasses()}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{org.name}</span>
                  <PlanBadge paid={hasPaidAccess(org)} />
                  <RoleBadge role={role} />
                </div>
                {isActive && (
                  <Link href="/settings/members" className={buttonClasses("secondary", "sm")}>
                    멤버 관리
                  </Link>
                )}
              </div>

              {isOwner && (
                <form action={renameOrg} className="mt-4 flex items-end gap-2">
                  <input type="hidden" name="org_id" value={org.id} />
                  {/* 팀마다 같은 폼이 반복되므로 id를 직접 지정해야 라벨이 올바른 입력에 연결된다 */}
                  <Input
                    id={`rename-org-${org.id}`}
                    label="팀 이름 변경"
                    name="name"
                    defaultValue={org.name}
                    className="w-64"
                  />
                  <Button type="submit">저장</Button>
                </form>
              )}

              <div className="mt-4">
                <AvatarStack members={membersByOrg.get(org.id) ?? []} />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-subtle">
        팀 전환은 메인 화면 상단의 팀명 옆 화살표에서 할 수 있습니다.
      </p>
    </div>
  );
}
