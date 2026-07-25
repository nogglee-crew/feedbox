import Link from "next/link";
import { notFound } from "next/navigation";
import { revokeQaSession } from "@/app/actions";
import { CopyButton } from "@/components/ui/copy-button";
import { IssueCard } from "@/features/issues/components/issue-card";
import { IssueFilters } from "@/features/issues/components/issue-filters";
import { CreateQaSessionButton } from "@/features/projects/components/create-qa-session-button";
import { QaSessionAccessToggle } from "@/features/projects/components/qa-session-access-toggle";
import { StatusBadge } from "@/components/ui/badge";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
  // Verify both ownership edges to prevent cross-organization ID substitution.
  if (
    !project ||
    !release ||
    project.org_id !== ctx.org.id ||
    release.project_id !== project.id
  ) {
    notFound();
  }

  const [members, issues, sessions] = await Promise.all([
    listOrgMembers(ctx.org.id),
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

      <CollapsibleSection
        title="세션 목록"
        action={<CreateQaSessionButton projectId={project.id} releaseId={release.id} />}
      >
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
                <QaSessionAccessToggle />
                <span className="flex items-center gap-1.5">
                  <CopyButton value={url} label="피드백모드 URL" variant="secondary" />
                  <CopyButton
                    value={`/board/${s.token}`}
                    label="이슈보드 URL"
                    variant="secondary"
                    relativeToOrigin
                  />
                </span>
                <span className="ml-auto text-xs text-subtle">
                  {s.created_by && `${s.created_by} · `}
                  {new Date(s.expires_at).toLocaleDateString("ko-KR")} 만료
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
            <EmptyState>URL을 발급해 테스터에게 전달하세요.</EmptyState>
          )}
        </ul>
      </CollapsibleSection>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="shrink-0 text-lg font-bold">
            이슈 <span className="font-normal text-muted">{issues?.length ?? 0}건</span>
          </h2>
          <IssueFilters q={q} status={statusFilter} />
        </div>

        <ul className="space-y-3">
          {(issues ?? []).map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              members={members}
              createdAtLabel={new Date(issue.created_at).toLocaleString("ko-KR")}
            />
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
