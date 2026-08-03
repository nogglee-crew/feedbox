import { Tag } from "@/components/ui/badge";
import { DataTable } from "@/features/analytics/components/data-table";
import { LocalTime } from "@/components/ui/local-time";
import { formatSince } from "@/lib/datetime";
import { listOrgs } from "@/features/analytics/server/admin-queries";

export default async function AdminOrgsPage() {
  const orgs = await listOrgs();
  const active = orgs.filter((org) => org.issueCount > 0).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">팀 {orgs.length}개</h1>
        <p className="mt-1 text-sm text-muted">
          이슈가 1건이라도 접수된 팀은 {active}개입니다. 나머지 {orgs.length - active}개는 SDK를
          붙이지 않았거나 아직 QA를 돌리지 않은 팀입니다.
        </p>
      </div>

      <DataTable
        rows={orgs}
        rowKey={(org) => org.id}
        empty="생성된 팀이 없습니다."
        columns={[
          {
            header: "팀",
            cell: (org) => (
              <div>
                <p className="text-foreground">{org.name}</p>
                <p className="text-xs text-subtle">/{org.slug}</p>
              </div>
            ),
          },
          {
            header: "플랜",
            cell: (org) => (
              <div className="flex flex-wrap items-center gap-1">
                <Tag tone={org.plan === "PRO" ? "primary" : "neutral"}>{org.plan}</Tag>
                {org.accessOverride === "NONE" ? null : (
                  <Tag tone="info">{org.accessOverride}</Tag>
                )}
              </div>
            ),
          },
          {
            header: "결제",
            secondary: true,
            cell: (org) => <span className="text-muted">{org.billingStatus}</span>,
          },
          { header: "멤버", align: "right", cell: (org) => org.memberCount },
          { header: "프로젝트", align: "right", cell: (org) => org.projectCount },
          {
            header: "이슈",
            align: "right",
            cell: (org) => (
              <span className={org.issueCount === 0 ? "text-subtle" : "text-foreground"}>
                {org.issueCount}
              </span>
            ),
          },
          {
            header: "마지막 이슈",
            cell: (org) => <span className="text-muted">{formatSince(org.lastIssueAt)}</span>,
          },
          {
            header: "생성일",
            secondary: true,
            cell: (org) => <LocalTime value={org.createdAt} style="shortDate" className="text-muted" />,
          },
        ]}
      />
    </div>
  );
}
