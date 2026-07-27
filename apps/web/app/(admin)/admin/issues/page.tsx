import { Tag, type Tone } from "@/components/ui/badge";
import { DataTable } from "@/features/analytics/components/data-table";
import { formatDateTime } from "@/features/analytics/components/format";
import { listRecentIssues } from "@/features/analytics/server/admin-queries";

const ISSUE_LIMIT = 200;

const STATUS_TONE: Record<string, Tone> = {
  OPEN: "danger",
  IN_PROGRESS: "warning",
  DONE: "success",
  CLOSED: "neutral",
};

export default async function AdminIssuesPage() {
  const issues = await listRecentIssues(ISSUE_LIMIT);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">최근 이슈 {issues.length}건</h1>
        <p className="mt-1 text-sm text-muted">
          어떤 내용이 접수되는지 보는 화면입니다. 최근 {ISSUE_LIMIT}건까지 표시합니다.
        </p>
      </div>

      <DataTable
        rows={issues}
        rowKey={(issue) => issue.id}
        empty="접수된 이슈가 없습니다."
        columns={[
          {
            header: "상태",
            cell: (issue) => (
              <Tag tone={STATUS_TONE[issue.status] ?? "neutral"}>{issue.status}</Tag>
            ),
          },
          {
            header: "내용",
            cell: (issue) => (
              <p className="whitespace-pre-wrap break-words text-foreground">{issue.memo}</p>
            ),
          },
          {
            header: "스크린샷",
            cell: (issue) => (
              <span className="text-muted">{issue.hasScreenshot ? "있음" : "-"}</span>
            ),
          },
          {
            header: "접수",
            cell: (issue) => (
              <span className="whitespace-nowrap text-muted">{formatDateTime(issue.createdAt)}</span>
            ),
          },
        ]}
      />
    </div>
  );
}
