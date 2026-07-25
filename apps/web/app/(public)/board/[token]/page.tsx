import { notFound } from "next/navigation";
import { IssueMeta } from "@/features/issues/components/issue-meta";
import { ISSUE_STATUS_TONE, IssueStatusBadge } from "@/features/issues/components/issue-status";
import { Dot } from "@/components/ui/badge";
import { Card, cardClasses } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getProject,
  getRelease,
  getSessionByToken,
  listIssues,
} from "@/features/projects/server/queries";
import { ISSUE_STATUSES, type IssueStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<IssueStatus, string> = {
  OPEN: "접수됨",
  IN_PROGRESS: "처리 중",
  DONE: "처리 완료",
  CLOSED: "종료",
};

export default async function BoardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Expired sessions remain readable for follow-up; revoked sessions do not.
  const session = await getSessionByToken(token);
  if (!session || session.revoked_at) notFound();

  const [project, release, issues] = await Promise.all([
    getProject(session.project_id),
    getRelease(session.release_id),
    listIssues(session.release_id, {}),
  ]);
  if (!project || !release) notFound();

  const counts = Object.fromEntries(
    ISSUE_STATUSES.map((s) => [s, issues.filter((i) => i.status === s).length]),
  ) as Record<IssueStatus, number>;
  const resolved = counts.DONE + counts.CLOSED;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-subtle">QA 이슈 현황</p>
        <h1 className="text-2xl font-bold">
          {project.name} <span className="text-subtle">·</span> {release.version}
        </h1>
        <p className="mt-1 text-sm text-muted">
          전체 {issues.length}건 중 {resolved}건 처리 완료
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ISSUE_STATUSES.map((s) => (
          <Card key={s} padding="sm">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <Dot tone={ISSUE_STATUS_TONE[s]} />
              {STATUS_LABEL[s]}
            </div>
            <div className="mt-1 text-2xl font-bold">{counts[s]}</div>
          </Card>
        ))}
      </div>

      <ul className="space-y-3">
        {issues.map((issue) => (
          <li key={issue.id} className={cardClasses()}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">#{issue.id}</span>
                  <IssueStatusBadge status={issue.status} label={STATUS_LABEL[issue.status]} />
                  <span className="text-xs text-subtle">
                    {new Date(issue.created_at).toLocaleString("ko-KR")}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{issue.memo}</p>
                <IssueMeta issue={issue} />
              </div>
            </div>
            {issue.screenshot_url && (
              <a href={issue.screenshot_url} target="_blank" rel="noreferrer" className="mt-4 block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={issue.screenshot_url}
                  alt={`이슈 #${issue.id} 스크린샷`}
                  className="max-h-48 rounded-lg border border-border object-contain"
                />
              </a>
            )}
          </li>
        ))}
        {issues.length === 0 && (
          <li className={cardClasses("none")}>
            <EmptyState>아직 등록된 이슈가 없습니다.</EmptyState>
          </li>
        )}
      </ul>

      <p className="text-center text-xs text-subtle">
        이 페이지는 읽기 전용입니다 · QA 세션 만료: {new Date(session.expires_at).toLocaleDateString("ko-KR")}
      </p>
    </div>
  );
}
