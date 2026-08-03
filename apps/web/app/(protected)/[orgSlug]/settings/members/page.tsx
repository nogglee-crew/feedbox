import { removeOrgMember } from "@/app/org-actions";
import { AddMemberForm } from "@/features/organizations/components/add-member-form";
import { MemberAvatar } from "@/features/organizations/components/avatar-stack";
import { RoleBadge } from "@/features/organizations/components/role-badge";
import { cardClasses } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { listOrgMembers, requireOrgBySlug } from "@/lib/orgs";
import { LocalTime } from "@/components/ui/local-time";

export const metadata = { title: "멤버 관리" };

export const dynamic = "force-dynamic";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const ctx = await requireOrgBySlug(orgSlug);

  const members = await listOrgMembers(ctx.org.id);
  const isOwner = ctx.role === "owner";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">멤버 관리</h1>
        <p className="mt-1 text-sm text-muted">
          {ctx.org.name} 팀의 멤버입니다. 멤버는 이 팀의 프로젝트와 이슈를 함께
          보고 담당자로 지정될 수 있습니다.
          <br />
          Google 계정 이메일로 초대하면, 해당 계정으로 로그인 시 자동으로
          연결됩니다.
        </p>
      </div>

      {isOwner && (
        <AddMemberForm orgId={ctx.org.id} orgSlug={ctx.org.slug} callerEmail={ctx.email} />
      )}

      <div className={`${cardClasses("none")} overflow-x-auto`}>
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
              <tr
                key={m.id}
                className="border-b border-border-subtle last:border-0"
              >
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2">
                    <MemberAvatar member={m} />
                    <span>
                      {m.name && (
                        <span className="mr-1.5 font-medium">{m.name}</span>
                      )}
                      <span className={m.name ? "text-xs text-muted" : ""}>
                        {m.email}
                      </span>
                      {m.email === ctx.email && (
                        <span className="ml-2 text-xs text-subtle">(나)</span>
                      )}
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3">
                  <RoleBadge role={m.role} />
                </td>
                <td className="px-5 py-3 text-xs text-muted">
                  {m.user_id ? "가입됨" : "초대됨 (미로그인)"}
                </td>
                <td className="px-5 py-3 text-xs text-muted">
                  <LocalTime value={m.created_at} style="date" />
                </td>
                {isOwner && (
                  <td className="px-5 py-3 text-right">
                    {m.email !== ctx.email && (
                      <form action={removeOrgMember}>
                        <input type="hidden" name="org_id" value={ctx.org.id} />
                        <input
                          type="hidden"
                          name="org_slug"
                          value={ctx.org.slug}
                        />
                        <input type="hidden" name="member_id" value={m.id} />
                        <SubmitButton size="sm" variant="danger" pendingText="삭제 중...">
                          삭제
                        </SubmitButton>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
