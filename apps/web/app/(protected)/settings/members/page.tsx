import { addOrgMember, removeOrgMember } from "@/app/org-actions";
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
        <p className="mt-1 text-sm text-gray-500">
          {ctx.org.name} 조직의 멤버입니다. 멤버는 대시보드 접근과 이슈 담당자 지정 대상이 됩니다.
        </p>
      </div>

      {isOwner && (
        <form action={addOrgMember} className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <input type="hidden" name="org_id" value={ctx.org.id} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">이메일 (Google 계정)</label>
            <input
              name="email"
              type="email"
              required
              placeholder="teammate@company.com"
              className="w-72 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">역할</label>
            <select name="role" className="rounded-md border border-gray-300 px-2 py-2 text-sm">
              <option value="member">member</option>
              <option value="owner">owner</option>
            </select>
          </div>
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            멤버 추가
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
              <th className="px-5 py-3 font-semibold">이메일</th>
              <th className="px-5 py-3 font-semibold">역할</th>
              <th className="px-5 py-3 font-semibold">가입 상태</th>
              <th className="px-5 py-3 font-semibold">등록일</th>
              {isOwner && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 last:border-0">
                <td className="px-5 py-3">
                  {m.email}
                  {m.email === ctx.email && <span className="ml-2 text-xs text-gray-400">(나)</span>}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      m.role === "owner" ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {m.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">{m.user_id ? "가입됨" : "초대됨 (미로그인)"}</td>
                <td className="px-5 py-3 text-xs text-gray-500">
                  {new Date(m.created_at).toLocaleDateString("ko-KR")}
                </td>
                {isOwner && (
                  <td className="px-5 py-3 text-right">
                    {m.email !== ctx.email && (
                      <form action={removeOrgMember}>
                        <input type="hidden" name="org_id" value={ctx.org.id} />
                        <input type="hidden" name="member_id" value={m.id} />
                        <button className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
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

      <p className="text-xs text-gray-400">
        멤버 추가 후 해당 이메일의 Google 계정으로 로그인하면 자동으로 조직에 연결됩니다.
      </p>
    </div>
  );
}
