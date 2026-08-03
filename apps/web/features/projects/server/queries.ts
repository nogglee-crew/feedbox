import { prisma } from "@/lib/db";
import { ISSUE_STATUSES, type Issue, type IssueStatus, type Project, type QaSession, type Release } from "@/lib/types";

export interface IssueFilter {
  status?: IssueStatus;
  sessionId?: string;
  q?: string;
}

/** 한 번에 불러오는 이슈 수 (무한 스크롤 페이지 크기) */
export const ISSUE_PAGE_SIZE = 10;

export interface IssuePage {
  issues: Issue[];
  /** 다음 페이지 커서(마지막 이슈 id). 더 없으면 null */
  nextCursor: number | null;
}

function issueWhere(releaseId: string, filter: IssueFilter) {
  return {
    releaseId,
    sessionId: filter.sessionId,
    status: filter.status,
    ...(filter.q
      ? {
          OR: [
            { memo: { contains: filter.q, mode: "insensitive" as const } },
            { pageUrl: { contains: filter.q, mode: "insensitive" as const } },
            { selector: { contains: filter.q, mode: "insensitive" as const } },
            { errorName: { contains: filter.q, mode: "insensitive" as const } },
            { errorCode: { contains: filter.q, mode: "insensitive" as const } },
            { errorMessage: { contains: filter.q, mode: "insensitive" as const } },
            { apiUrl: { contains: filter.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

const iso = (value: Date) => value.toISOString();

function mapProject(row: {
  id: string;
  orgId: string;
  name: string;
  projectKey: string;
  apiKey: string;
  baseUrl: string | null;
  createdAt: Date;
}): Project {
  return {
    id: row.id,
    org_id: row.orgId,
    name: row.name,
    project_key: row.projectKey,
    api_key: row.apiKey,
    base_url: row.baseUrl,
    created_at: iso(row.createdAt),
  };
}

function mapRelease(row: {
  id: string;
  projectId: string;
  version: string;
  status: "OPEN" | "CLOSED";
  createdAt: Date;
}): Release {
  return {
    id: row.id,
    project_id: row.projectId,
    version: row.version,
    status: row.status,
    created_at: iso(row.createdAt),
  };
}

function mapSession(row: {
  id: string;
  token: string;
  projectId: string;
  releaseId: string;
  createdBy: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}): QaSession {
  return {
    id: row.id,
    token: row.token,
    project_id: row.projectId,
    release_id: row.releaseId,
    created_by: row.createdBy,
    expires_at: iso(row.expiresAt),
    revoked_at: row.revokedAt ? iso(row.revokedAt) : null,
    created_at: iso(row.createdAt),
  };
}

function mapIssue(row: {
  id: number;
  number: number;
  projectId: string;
  releaseId: string;
  sessionId: string | null;
  pageUrl: string;
  selector: string;
  elementText: string | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  browser: string | null;
  errorName: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  errorStack: string | null;
  apiMethod: string | null;
  apiUrl: string | null;
  apiStatus: number | null;
  memo: string;
  screenshotUrl: string | null;
  status: IssueStatus;
  assignee: string | null;
  createdAt: Date;
}): Issue {
  return {
    id: row.id,
    number: row.number,
    project_id: row.projectId,
    release_id: row.releaseId,
    session_id: row.sessionId,
    page_url: row.pageUrl,
    selector: row.selector,
    element_text: row.elementText,
    viewport_width: row.viewportWidth,
    viewport_height: row.viewportHeight,
    browser: row.browser,
    error_name: row.errorName,
    error_code: row.errorCode,
    error_message: row.errorMessage,
    error_stack: row.errorStack,
    api_method: row.apiMethod,
    api_url: row.apiUrl,
    api_status: row.apiStatus,
    memo: row.memo,
    screenshot_url: row.screenshotUrl,
    status: row.status,
    assignee: row.assignee,
    created_at: iso(row.createdAt),
  };
}

export async function listProjectsForOrg(orgId: string): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProject);
}

export interface ProjectListItem extends Project {
  /** 아직 처리되지 않은 이슈 수 (접수됨 + 처리 중) */
  open_issue_count: number;
  /** 가장 최근에 만든 릴리즈 버전. 없으면 null */
  latest_release_version: string | null;
}

/** 프로젝트 수와 무관하게 쿼리 3번으로 끝낸다 */
export async function listProjectsWithActivity(orgId: string): Promise<ProjectListItem[]> {
  const rows = await prisma.project.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
  });
  if (rows.length === 0) return [];

  const projectIds = rows.map((row) => row.id);
  const [issueCounts, releases] = await Promise.all([
    prisma.issue.groupBy({
      by: ["projectId"],
      where: { projectId: { in: projectIds }, status: { in: ["OPEN", "IN_PROGRESS"] } },
      _count: { _all: true },
    }),
    prisma.release.findMany({
      where: { projectId: { in: projectIds } },
      select: { projectId: true, version: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const countByProject = new Map(issueCounts.map((row) => [row.projectId, row._count._all]));
  // 최신순이라 먼저 담긴 값이 가장 최근 릴리즈다
  const releaseByProject = new Map<string, string>();
  for (const release of releases) {
    if (!releaseByProject.has(release.projectId)) {
      releaseByProject.set(release.projectId, release.version);
    }
  }

  return rows.map((row) => ({
    ...mapProject(row),
    open_issue_count: countByProject.get(row.id) ?? 0,
    latest_release_version: releaseByProject.get(row.id) ?? null,
  }));
}

export async function getProject(id: string): Promise<Project | null> {
  const row = await prisma.project.findUnique({ where: { id } });
  return row ? mapProject(row) : null;
}

export async function listReleases(projectId: string): Promise<Release[]> {
  const rows = await prisma.release.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRelease);
}

export async function getRelease(id: string): Promise<Release | null> {
  const row = await prisma.release.findUnique({ where: { id } });
  return row ? mapRelease(row) : null;
}

/** 릴리즈가 해당 조직 소속인지 검증 (SDK 외 서버 액션 인가용) */
export async function releaseBelongsToOrg(releaseId: string, orgId: string): Promise<boolean> {
  const row = await prisma.release.findFirst({
    where: { id: releaseId, project: { orgId } },
    select: { id: true },
  });
  return row !== null;
}

export async function listSessions(releaseId: string): Promise<QaSession[]> {
  const rows = await prisma.qaSession.findMany({
    where: { releaseId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapSession);
}

export async function getSessionByToken(token: string): Promise<QaSession | null> {
  const row = await prisma.qaSession.findUnique({ where: { token } });
  return row ? mapSession(row) : null;
}

export async function listIssues(releaseId: string, filter: IssueFilter): Promise<Issue[]> {
  const rows = await prisma.issue.findMany({
    where: issueWhere(releaseId, filter),
    orderBy: { id: "desc" },
  });
  return rows.map(mapIssue);
}

/** 커서 기반 한 페이지. id 내림차순(생성 역순)이라 id가 안정적인 커서가 된다. */
export async function listIssuesPage(
  releaseId: string,
  filter: IssueFilter,
  cursor?: number | null,
): Promise<IssuePage> {
  const rows = await prisma.issue.findMany({
    where: issueWhere(releaseId, filter),
    orderBy: { id: "desc" },
    take: ISSUE_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > ISSUE_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, ISSUE_PAGE_SIZE) : rows;
  return {
    issues: page.map(mapIssue),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

/** 상태별 이슈 수. 페이지네이션과 무관하게 전체를 집계한다 (탭 배지용). */
export async function countIssuesByStatus(
  releaseId: string,
  filter: Pick<IssueFilter, "sessionId" | "q">,
): Promise<Record<IssueStatus, number>> {
  const grouped = await prisma.issue.groupBy({
    by: ["status"],
    where: issueWhere(releaseId, filter),
    _count: { _all: true },
  });
  const counts = Object.fromEntries(ISSUE_STATUSES.map((s) => [s, 0])) as Record<IssueStatus, number>;
  for (const row of grouped) counts[row.status] = row._count._all;
  return counts;
}
