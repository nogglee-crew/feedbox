import Link from "next/link";
import { renameOrg } from "@/app/org-actions";
import { AvatarStack } from "@/components/avatar-stack";
import { PlanBadge, RoleBadge } from "@/components/badge";
import { CreateTeamButton } from "@/components/create-team";
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
            <li key={org.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{org.name}</span>
                  <PlanBadge paid={hasPaidAccess(org)} />
                  <RoleBadge role={role} />
                </div>
                {isActive && (
                  <Link
                    href="/settings/members"
                    className="rounded-md border border-border-strong px-3 py-1.5 text-xs font-semibold hover:bg-surface-hover"
                  >
                    멤버 관리
                  </Link>
                )}
              </div>

              {isOwner && (
                <form action={renameOrg} className="mt-4 flex items-end gap-2">
                  <input type="hidden" name="org_id" value={org.id} />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted">팀 이름 변경</label>
                    <input
                      name="name"
                      defaultValue={org.name}
                      className="w-64 rounded-md border border-border-strong px-3 py-2 text-sm"
                    />
                  </div>
                  <button className="rounded-md border border-border-strong px-3 py-2 text-sm hover:bg-surface-hover">
                    저장
                  </button>
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
