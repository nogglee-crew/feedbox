import type { Metadata } from "next";
import { OG_IMAGES, TWITTER_IMAGES } from "@/lib/site-metadata";
import { notFound } from "next/navigation";
import { MadeByBadge } from "@/components/made-by-badge";
import { LocalTime } from "@/components/ui/local-time";
import { BoardViewTracker } from "@/features/analytics/components/board-view-tracker";
import { Tag } from "@/components/ui/badge";
import { AnchorButton } from "@/components/ui/button";
import { IssueBoard } from "@/features/issues/components/issue-board";
import {
  countIssuesByStatus,
  getProject,
  getRelease,
  getSessionByToken,
  listIssuesPage,
} from "@/features/projects/server/queries";
import { ISSUE_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

function qaUrl(baseUrl: string | null, token: string): string | null {
  if (!baseUrl) return null;
  const target = baseUrl.replace(/#.*$/, "");
  return `${target}#session=${encodeURIComponent(token)}`;
}

/** 고객사에 링크로 전달되는 화면이라 미리보기는 갖추되, 이슈 내용이 색인되면 안 된다 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const session = await getSessionByToken(token);
  const noIndex = { robots: { index: false, follow: false } };
  if (!session) return { title: "이슈 보드", ...noIndex };

  const [project, release, counts] = await Promise.all([
    getProject(session.project_id),
    getRelease(session.release_id),
    countIssuesByStatus(session.release_id, { sessionId: session.id }),
  ]);
  if (!project || !release) return { title: "이슈 보드", ...noIndex };

  const total = ISSUE_STATUSES.reduce((sum, s) => sum + counts[s], 0);
  const resolved = counts.DONE + counts.CLOSED;
  const title = `${project.name} ${release.version} 이슈 보드`;
  const description = `전체 ${total}건 중 ${resolved}건 처리 완료`;

  return {
    title,
    description,
    ...noIndex,
    openGraph: { title, description, type: "website", images: OG_IMAGES },
    twitter: { card: "summary", title, description, images: TWITTER_IMAGES },
  };
}

export default async function BoardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const session = await getSessionByToken(token);
  if (!session) notFound();

  const [project, release, issuePage, counts] = await Promise.all([
    getProject(session.project_id),
    getRelease(session.release_id),
    listIssuesPage(session.release_id, { sessionId: session.id }),
    countIssuesByStatus(session.release_id, { sessionId: session.id }),
  ]);
  if (!project || !release) notFound();

  const totalIssues = ISSUE_STATUSES.reduce((sum, s) => sum + counts[s], 0);
  const resolved = counts.DONE + counts.CLOSED;
  const feedbackUrl = qaUrl(project.base_url, session.token);

  return (
    <div className="space-y-8 pb-16">
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
              전체 {totalIssues}건 중 <b className="text-foreground">{resolved}건</b> 처리 완료
            </p>
            <p className="text-xs text-subtle">
              <LocalTime value={session.expires_at} style="date" /> 만료
            </p>
          </div>
          <hr className="border-border" />
        </div>
      </header>

      <IssueBoard
        token={session.token}
        counts={counts}
        initialItems={issuePage.issues}
        initialCursor={issuePage.nextCursor}
      />

      <MadeByBadge />
      <BoardViewTracker />
    </div>
  );
}
