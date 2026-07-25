import { addOrgMember, removeOrgMember } from "@/app/org-actions";
import { MemberAvatar } from "@/components/avatar-stack";
import { RoleBadge } from "@/components/badge";
import { listOrgMembers, requireOrg } from "@/lib/orgs";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const ctx = await requireOrg();

  const members = await listOrgMembers(ctx.org.id);
  const isOwner = ctx.role === "owner";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">멤버 관리</h1>
        <p className="mt-1 text-sm text-muted">
          {ctx.org.name} 조직의 멤버입니다. 멤버는 대시보드 접근과 이슈 담당자 지정 대상이 됩니다.
        </p>
      </div>

      {isOwner && (
        <form action={addOrgMember} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
          <input type="hidden" name="org_id" value={ctx.org.id} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted">이메일 (Google 계정)</label>
            <input
              name="email"
              type="email"
              required
              placeholder="teammate@company.com"
              className="w-72 rounded-md border border-border-strong px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted">역할</label>
            <select name="role" className="rounded-md border border-border-strong px-2 py-2 text-sm">
              <option value="member">member</option>
              <option value="owner">owner</option>
            </select>
          </div>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-hover">
            멤버 추가
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-5 py-3 font-semibold">이메일</th>
              <th className="px-5 py-3 font-semibold">역할</th>
              <th className="px-5 py-3 font-semibold">가입 상태</th>
              <th className="px-5 py-3 font-semibold">등록일</th>
              {isOwner && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-border-subtle last:border-0">
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2">
                    <MemberAvatar member={m} />
                    <span>
                      {m.name && <span className="mr-1.5 font-medium">{m.name}</span>}
                      <span className={m.name ? "text-xs text-muted" : ""}>{m.email}</span>
                      {m.email === ctx.email && (
                        <span className="ml-2 text-xs text-subtle">(나)</span>
                      )}
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3">
                  <RoleBadge role={m.role} />
                </td>
                <td className="px-5 py-3 text-xs text-muted">{m.user_id ? "가입됨" : "초대됨 (미로그인)"}</td>
                <td className="px-5 py-3 text-xs text-muted">
                  {new Date(m.created_at).toLocaleDateString("ko-KR")}
                </td>
                {isOwner && (
                  <td className="px-5 py-3 text-right">
                    {m.email !== ctx.email && (
                      <form action={removeOrgMember}>
                        <input type="hidden" name="org_id" value={ctx.org.id} />
                        <input type="hidden" name="member_id" value={m.id} />
                        <button className="rounded-md border border-danger-muted px-2 py-1 text-xs text-danger hover:bg-danger-subtle">
                          삭제
                        </button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-subtle">
        멤버 추가 후 해당 이메일의 Google 계정으로 로그인하면 자동으로 조직에 연결됩니다.
      </p>
    </div>
  );
}
