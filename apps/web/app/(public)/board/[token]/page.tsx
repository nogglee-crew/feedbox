import { notFound } from "next/navigation";
import { Tag } from "@/components/ui/badge";
import { AnchorButton } from "@/components/ui/button";
import { IssueBoard } from "@/features/issues/components/issue-board";
import {
  getProject,
  getRelease,
  getSessionByToken,
  listIssues,
} from "@/features/projects/server/queries";
import { ISSUE_STATUSES, type IssueStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function qaUrl(baseUrl: string | null, token: string): string | null {
  if (!baseUrl) return null;
  const target = baseUrl.replace(/#.*$/, "");
  return `${target}#session=${encodeURIComponent(token)}`;
}

export default async function BoardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const session = await getSessionByToken(token);
  if (!session) notFound();

  const [project, release, issues] = await Promise.all([
    getProject(session.project_id),
    getRelease(session.release_id),
    listIssues(session.release_id, { sessionId: session.id }),
  ]);
  if (!project || !release) notFound();

  const counts = Object.fromEntries(
    ISSUE_STATUSES.map((s) => [s, issues.filter((i) => i.status === s).length]),
  ) as Record<IssueStatus, number>;
  const resolved = counts.DONE + counts.CLOSED;
  const sessionExpiresAt = new Date(session.expires_at).toLocaleDateString("ko-KR");
  const boardIssues = issues.map((issue) => {
    const createdAt = new Date(issue.created_at);
    return {
      issue,
      createdAtLabel: createdAt.toLocaleString("ko-KR"),
      createdDateLabel: createdAt.toLocaleDateString("ko-KR"),
      createdTimeLabel: createdAt.toLocaleTimeString("ko-KR"),
    };
  });
  const feedbackUrl = qaUrl(project.base_url, session.token);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-subtle">이슈 보드</p>
            <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-bold">
              <span className="truncate">{project.name}</span>
              <Tag>{release.version}</Tag>
            </h1>
          </div>
          {feedbackUrl && (
            <AnchorButton href={feedbackUrl} variant="primary" size="md">
              피드백 모드로 이동하기
            </AnchorButton>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
            <p className="text-muted">
              전체 {issues.length}건 중 <b className="text-foreground">{resolved}건</b> 처리 완료
            </p>
            <p className="text-xs text-subtle">{sessionExpiresAt} 만료</p>
          </div>
          <hr className="border-border" />
        </div>
      </header>

      <IssueBoard issues={boardIssues} token={session.token} />
    </div>
  );
}
