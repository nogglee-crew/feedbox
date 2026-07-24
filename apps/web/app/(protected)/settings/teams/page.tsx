import Link from "next/link";
import { createOrganization, renameOrg, setActiveOrg } from "@/app/org-actions";
import { Badge, PlanBadge, RoleBadge } from "@/components/badge";
import { hasPaidAccess } from "@/features/billing/domain/entitlements";
import { requireOrg } from "@/lib/orgs";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const ctx = await requireOrg();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">팀 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          속한 팀을 전환하거나, 새 팀을 만들고, 팀 이름과 멤버를 관리합니다.
        </p>
      </div>

      <form
        action={createOrganization}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">새 팀 이름</label>
          <input
            name="name"
            required
            placeholder="예: 노글리 팀"
            className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          팀 생성
        </button>
      </form>

      <ul className="space-y-3">
        {ctx.memberships.map(({ org, role }) => {
          const isActive = org.id === ctx.org.id;
          const isOwner = role === "owner";
          return (
            <li key={org.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{org.name}</span>
                  <PlanBadge paid={hasPaidAccess(org)} />
                  <RoleBadge role={role} />
                  {isActive && <Badge tone="amber">현재 팀</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  {!isActive && (
                    <form action={setActiveOrg}>
                      <input type="hidden" name="org_id" value={org.id} />
                      <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50">
                        이 팀으로 전환
                      </button>
                    </form>
                  )}
                  {isActive && (
                    <Link
                      href="/settings/members"
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50"
                    >
                      멤버 관리
                    </Link>
                  )}
                </div>
              </div>

              {isOwner && (
                <form action={renameOrg} className="mt-4 flex items-end gap-2">
                  <input type="hidden" name="org_id" value={org.id} />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">팀 이름 변경</label>
                    <input
                      name="name"
                      defaultValue={org.name}
                      className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <button className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
                    저장
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-gray-400">
        다른 팀의 멤버를 관리하려면 먼저 그 팀으로 전환하세요. 팀 전환은 화면 우측 상단 프로필
        메뉴에도 표시됩니다.
      </p>
    </div>
  );
}
