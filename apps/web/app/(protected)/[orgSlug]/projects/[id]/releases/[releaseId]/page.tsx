import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revokeQaSession } from "@/app/actions";
import { CopyButton } from "@/components/ui/copy-button";
import { LocalTime } from "@/components/ui/local-time";
import { DashboardIssueList } from "@/features/issues/components/dashboard-issue-list";
import { IssueFilters } from "@/features/issues/components/issue-filters";
import { getOrgCommentSummaries, getOrgViewer } from "@/features/issues/server/comments";
import { CreateQaSessionButton } from "@/features/projects/components/create-qa-session-button";
import { QaSessionAccessToggle } from "@/features/projects/components/qa-session-access-toggle";
import { StatusBadge } from "@/components/ui/badge";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  countIssuesByStatus,
  getProject,
  getRelease,
  listIssuesPage,
  listSessions,
} from "@/features/projects/server/queries";
import { listOrgMembers, requireOrgBySlug } from "@/lib/orgs";
import { ISSUE_STATUSES, type IssueStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function qaUrl(baseUrl: string | null, token: string): string {
  const target = baseUrl?.replace(/#.*$/, "") ?? "";
  return `${target}#session=${encodeURIComponent(token)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; releaseId: string }>;
}): Promise<Metadata> {
  const { id, releaseId } = await params;
  const [project, release] = await Promise.all([getProject(id), getRelease(releaseId)]);
  if (!project || !release) return { title: "릴리즈" };
  return { title: `${release.version} · ${project.name}` };
}

export default async function ReleasePage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; id: string; releaseId: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { orgSlug, id, releaseId } = await params;
  const { status: statusFilter, q } = await searchParams;

  const ctx = await requireOrgBySlug(orgSlug);
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

  const activeStatus = ISSUE_STATUSES.includes(statusFilter as IssueStatus)
    ? (statusFilter as IssueStatus)
    : undefined;
  const [members, issuePage, issueCount, sessions, viewer] = await Promise.all([
    listOrgMembers(ctx.org.id),
    listIssuesPage(releaseId, { status: activeStatus, q: q || undefined }),
    countIssuesByStatus(releaseId, { q: q || undefined }),
    listSessions(releaseId),
    getOrgViewer(ctx.org.id),
  ]);
  const commentSummaries = await getOrgCommentSummaries(
    ctx.org.id,
    issuePage.issues.map((issue) => issue.id),
  );
  const totalIssues = ISSUE_STATUSES.reduce((sum, s) => sum + issueCount[s], 0);

  const now = Date.now();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm text-subtle">
          <Link href={`/${ctx.org.slug}/projects`} className="hover:text-muted">
            프로젝트
          </Link>{" "}
          /{" "}
          <Link href={`/${ctx.org.slug}/projects/${project.id}`} className="hover:text-muted">
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
        action={<CreateQaSessionButton orgSlug={ctx.org.slug} projectId={project.id} releaseId={release.id} />}
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
                  <CopyButton
                    value={url}
                    label="피드백모드 URL"
                    variant="secondary"
                    event="qa_url_copy"
                    eventParams={{ url_type: "feedback" }}
                  />
                  <CopyButton
                    value={`/board/${s.token}`}
                    label="이슈보드 URL"
                    variant="secondary"
                    relativeToOrigin
                    event="qa_url_copy"
                    eventParams={{ url_type: "board" }}
                  />
                </span>
                <span className="ml-auto text-xs text-subtle">
                  {s.created_by && `${s.created_by} · `}
                  <LocalTime value={s.expires_at} style="date" /> 만료
                </span>
                {active && (
                  <form action={revokeQaSession}>
                    <input type="hidden" name="org_slug" value={ctx.org.slug} />
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
            이슈 <span className="font-normal text-muted">{totalIssues}건</span>
          </h2>
          <IssueFilters q={q} status={statusFilter} />
        </div>

        <DashboardIssueList
          orgSlug={ctx.org.slug}
          releaseId={releaseId}
          status={statusFilter ?? ""}
          q={q ?? ""}
          members={members}
          initialItems={issuePage.issues}
          initialCursor={issuePage.nextCursor}
          initialComments={commentSummaries}
          viewer={viewer}
        />
      </section>
    </div>
  );
}
