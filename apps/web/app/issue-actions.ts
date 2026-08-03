"use server";

import {
  getSessionByToken,
  listIssuesPage,
  releaseBelongsToOrg,
} from "@/features/projects/server/queries";
import { requireOrgBySlug } from "@/lib/orgs";
import { ISSUE_STATUSES, type Issue, type IssueStatus } from "@/lib/types";

function parseStatus(value: unknown): IssueStatus | undefined {
  return ISSUE_STATUSES.includes(value as IssueStatus) ? (value as IssueStatus) : undefined;
}

export interface DashboardIssuePage {
  items: Issue[];
  nextCursor: number | null;
}

/** 대시보드 이슈 더 불러오기 — 호출자가 해당 조직 소속인지 검증한다 */
export async function loadMoreDashboardIssues(input: {
  orgSlug: string;
  releaseId: string;
  cursor: number | null;
  status?: string;
  q?: string;
}): Promise<DashboardIssuePage> {
  const ctx = await requireOrgBySlug(input.orgSlug);
  if (!(await releaseBelongsToOrg(input.releaseId, ctx.org.id))) {
    return { items: [], nextCursor: null };
  }

  const page = await listIssuesPage(
    input.releaseId,
    { status: parseStatus(input.status), q: input.q || undefined },
    input.cursor,
  );
  return { items: page.issues, nextCursor: page.nextCursor };
}

export interface BoardIssuePage {
  items: Issue[];
  nextCursor: number | null;
}

/** 공개 보드 이슈 더 불러오기 — 세션 토큰으로 인가하고 그 세션 범위로만 조회한다 */
export async function loadMoreBoardIssues(input: {
  token: string;
  cursor: number | null;
  status?: string;
}): Promise<BoardIssuePage> {
  const session = await getSessionByToken(input.token);
  if (!session) return { items: [], nextCursor: null };

  const page = await listIssuesPage(
    session.release_id,
    { sessionId: session.id, status: parseStatus(input.status) },
    input.cursor,
  );
  return { items: page.issues, nextCursor: page.nextCursor };
}
