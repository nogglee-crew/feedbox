import { Tag } from "@/components/ui/badge";
import { DataTable } from "@/features/analytics/components/data-table";
import { formatDate, formatSince } from "@/features/analytics/components/format";
import {
  listMembershipActivity,
  listSignups,
  summarizeMembershipsByUser,
} from "@/features/analytics/server/admin-queries";

export default async function AdminUsersPage() {
  const [signups, memberships] = await Promise.all([listSignups(), listMembershipActivity()]);
  const activityByUserId = summarizeMembershipsByUser(memberships, signups);
  const withoutTeam = signups.filter((user) => !activityByUserId.has(user.id)).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">회원 {signups.length}명</h1>
        <p className="mt-1 text-sm text-muted">
          가입 계정은 Supabase Auth가 원본입니다. 팀에 속하지 않은 회원 {withoutTeam}명은 여기서만
          보입니다.
        </p>
      </div>

      <DataTable
        rows={signups}
        rowKey={(user) => user.id}
        empty="가입한 회원이 없습니다."
        columns={[
          {
            header: "이메일",
            cell: (user) => <span className="text-foreground">{user.email}</span>,
          },
          {
            header: "소속 팀",
            cell: (user) => {
              const activity = activityByUserId.get(user.id);
              if (!activity) return <Tag tone="neutral">팀 없음</Tag>;
              // 한 사람이 여러 팀에 속할 수 있어 역할과 함께 전부 보여준다
              return (
                <div className="flex flex-col gap-0.5">
                  {activity.orgs.map((org) => (
                    <span key={org.slug} className="text-foreground">
                      {org.name}
                      <span className="ml-1 text-xs text-subtle">
                        {org.role === "OWNER" ? "소유자" : "멤버"}
                      </span>
                    </span>
                  ))}
                </div>
              );
            },
          },
          {
            header: "진입 경로",
            cell: (user) => {
              const activity = activityByUserId.get(user.id);
              if (!activity) return <span className="text-subtle">-</span>;
              return activity.ownsOrg ? (
                <Tag tone="primary">직접 생성</Tag>
              ) : (
                <Tag tone="info">초대</Tag>
              );
            },
          },
          {
            header: "프로젝트",
            align: "right",
            cell: (user) => activityByUserId.get(user.id)?.projectCount ?? 0,
          },
          {
            header: "이슈",
            align: "right",
            cell: (user) => {
              const count = activityByUserId.get(user.id)?.issueCount ?? 0;
              return <span className={count === 0 ? "text-subtle" : "text-foreground"}>{count}</span>;
            },
          },
          {
            header: "첫 이슈",
            secondary: true,
            cell: (user) => (
              <span className="text-muted">
                {formatSince(activityByUserId.get(user.id)?.firstIssueAt)}
              </span>
            ),
          },
          {
            header: "로그인",
            secondary: true,
            cell: (user) => <span className="text-muted">{user.provider ?? "-"}</span>,
          },
          {
            header: "가입일",
            cell: (user) => <span className="text-muted">{formatDate(user.createdAt)}</span>,
          },
          {
            header: "최근 로그인",
            cell: (user) => <span className="text-muted">{formatSince(user.lastSignInAt)}</span>,
          },
        ]}
      />
    </div>
  );
}
