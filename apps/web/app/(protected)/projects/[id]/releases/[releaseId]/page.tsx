import Link from "next/link";
import { notFound } from "next/navigation";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";
import { createQaSession, revokeQaSession } from "@/app/actions";
import { CopyButton } from "@/components/ui/copy-button";
import { AssigneeControl, IssueStatusSelect } from "@/features/issues/components/issue-controls";
import { IssueMeta } from "@/features/issues/components/issue-meta";
import { StatusBadge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { Code } from "@/components/ui/code";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  getProject,
  getRelease,
  listIssues,
  listSessions,
} from "@/features/projects/server/queries";
import { listOrgMembers, requireOrg } from "@/lib/orgs";
import { ISSUE_STATUSES, type IssueStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function qaUrl(baseUrl: string | null, token: string): string {
  const target = baseUrl?.replace(/#.*$/, "") ?? "";
  return `${target}#session=${encodeURIComponent(token)}`;
}

export default async function ReleasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; releaseId: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { id, releaseId } = await params;
  const { status: statusFilter, q } = await searchParams;

  const ctx = await requireOrg();
  const [project, release] = await Promise.all([getProject(id), getRelease(releaseId)]);
  // 프로젝트가 내 조직 소속인지 + 릴리즈가 그 프로젝트 소속인지 모두 확인해야
  // URL의 releaseId를 다른 조직 것으로 바꿔치기하는 접근을 막을 수 있다
  if (
    !project ||
    !release ||
    project.org_id !== ctx.org.id ||
    release.project_id !== project.id
  ) {
    notFound();
  }

  const [memberEmails, issues, sessions] = await Promise.all([
    listOrgMembers(ctx.org.id).then((members) => members.map((m) => m.email)),
    listIssues(releaseId, {
      status: ISSUE_STATUSES.includes(statusFilter as IssueStatus)
        ? (statusFilter as IssueStatus)
        : undefined,
      q: q || undefined,
    }),
    listSessions(releaseId),
  ]);

  const now = Date.now();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm text-subtle">
          <Link href="/projects" className="hover:text-muted">
            프로젝트
          </Link>{" "}
          /{" "}
          <Link href={`/projects/${project.id}`} className="hover:text-muted">
            {project.name}
          </Link>{" "}
          /
        </div>
        <h1 className="flex items-center gap-3 text-2xl font-bold">
          {release.version}
          <StatusBadge tone={release.status === "OPEN" ? "success" : "neutral"}>{release.status}</StatusBadge>
        </h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">QA 세션</h2>
        <form action={createQaSession} className={`${cardClasses("sm")} flex flex-wrap items-end gap-3`}>
          <input type="hidden" name="project_id" value={project.id} />
          <input type="hidden" name="release_id" value={release.id} />
          <Input label="발급 대상 (선택)" name="created_by" placeholder="예: 고객사 QA팀" />
          <Input
            label="유효기간 (일)"
            name="days"
            type="number"
            defaultValue={7}
            min={1}
            max={90}
            className="w-24"
          />
          <Button type="submit" variant="primary">
            QA URL 발급
          </Button>
        </form>

        <ul className={`${cardClasses("none")} divide-y divide-border`}>
          {(sessions ?? []).map((s) => {
            const expired = new Date(s.expires_at).getTime() < now;
            const active = !s.revoked_at && !expired;
            const url = qaUrl(project.base_url, s.token);
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <StatusBadge tone={active ? "success" : "neutral"}>
                  {s.revoked_at ? "종료됨" : expired ? "만료됨" : "활성"}
                </StatusBadge>
                <Code className="max-w-md flex-1 truncate">{url}</Code>
                <CopyButton value={url} label="QA URL 복사" />
                <a
                  href={`/board/${s.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClasses("ghost", "sm")}
                >
                  <HiArrowTopRightOnSquare aria-hidden className="size-3.5" />
                  현황판
                </a>
                <CopyButton value={`/board/${s.token}`} label="현황판 URL 복사" relativeToOrigin />
                <span className="text-xs text-subtle">
                  {s.created_by && `${s.created_by} · `}~{new Date(s.expires_at).toLocaleDateString("ko-KR")}
                </span>
                {active && (
                  <form action={revokeQaSession}>
                    <input type="hidden" name="session_id" value={s.id} />
                    <input type="hidden" name="project_id" value={project.id} />
                    <input type="hidden" name="release_id" value={release.id} />
                    <Button type="submit" size="sm" variant="danger">
                      종료
                    </Button>
                  </form>
                )}
              </li>
            );
          })}
          {(!sessions || sessions.length === 0) && (
            <EmptyState>QA URL을 발급해 테스터에게 전달하세요.</EmptyState>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">이슈 ({issues?.length ?? 0})</h2>
          <form className="flex items-center gap-2" method="get">
            <Input
              name="q"
              defaultValue={q ?? ""}
              aria-label="이슈 검색"
              placeholder="메모/URL/selector 검색"
            />
            <Select name="status" defaultValue={statusFilter ?? ""} aria-label="상태 필터">
              <option value="">전체 상태</option>
              {ISSUE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Button type="submit">필터</Button>
          </form>
        </div>

        <ul className="space-y-3">
          {(issues ?? []).map((issue) => (
            <li key={issue.id} className={cardClasses()}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">#{issue.id}</span>
                    <span className="truncate text-xs text-subtle">{new Date(issue.created_at).toLocaleString("ko-KR")}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{issue.memo}</p>
                  <IssueMeta issue={issue} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <IssueStatusSelect issueId={issue.id} status={issue.status} />
                  <AssigneeControl issueId={issue.id} assignee={issue.assignee} members={memberEmails} />
                </div>
              </div>
              {issue.screenshot_url && (
                <a href={issue.screenshot_url} target="_blank" rel="noreferrer" className="mt-4 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={issue.screenshot_url}
                    alt={`이슈 #${issue.id} 스크린샷`}
                    className="max-h-64 rounded-lg border border-border object-contain"
                  />
                </a>
              )}
            </li>
          ))}
          {(!issues || issues.length === 0) && (
            <li className={cardClasses("none")}>
              <EmptyState>아직 등록된 이슈가 없습니다.</EmptyState>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
