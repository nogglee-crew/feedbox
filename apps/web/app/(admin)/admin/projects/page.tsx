import { Tag } from "@/components/ui/badge";
import { DataTable } from "@/features/analytics/components/data-table";
import { formatDate, formatSince } from "@/features/analytics/components/format";
import { listProjects } from "@/features/analytics/server/admin-queries";

export default async function AdminProjectsPage() {
  const projects = await listProjects();
  const withoutBaseUrl = projects.filter((project) => !project.baseUrl).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">프로젝트 {projects.length}개</h1>
        <p className="mt-1 text-sm text-muted">
          서비스 URL이 비어 있는 프로젝트가 {withoutBaseUrl}개입니다. 이 값이 없으면 QA URL을 만들 수
          없어 테스터에게 전달할 수 없습니다.
        </p>
      </div>

      <DataTable
        rows={projects}
        rowKey={(project) => project.id}
        empty="생성된 프로젝트가 없습니다."
        columns={[
          {
            header: "프로젝트",
            cell: (project) => (
              <div>
                <p className="text-foreground">{project.name}</p>
                <p className="text-xs text-subtle">{project.projectKey}</p>
              </div>
            ),
          },
          {
            header: "팀",
            cell: (project) => <span className="text-muted">{project.orgName}</span>,
          },
          {
            header: "서비스 URL",
            cell: (project) =>
              project.baseUrl ? (
                <a
                  href={project.baseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block max-w-xs truncate text-primary hover:underline"
                >
                  {project.baseUrl}
                </a>
              ) : (
                <Tag tone="warning">미설정</Tag>
              ),
          },
          { header: "릴리즈", align: "right", cell: (project) => project.releaseCount },
          { header: "QA 세션", align: "right", cell: (project) => project.sessionCount },
          {
            header: "이슈",
            align: "right",
            cell: (project) => (
              <span className={project.issueCount === 0 ? "text-subtle" : "text-foreground"}>
                {project.issueCount}
              </span>
            ),
          },
          {
            header: "미해결",
            align: "right",
            secondary: true,
            cell: (project) => <span className="text-muted">{project.openIssueCount}</span>,
          },
          {
            header: "마지막 이슈",
            cell: (project) => <span className="text-muted">{formatSince(project.lastIssueAt)}</span>,
          },
          {
            header: "생성일",
            secondary: true,
            cell: (project) => <span className="text-muted">{formatDate(project.createdAt)}</span>,
          },
        ]}
      />
    </div>
  );
}
