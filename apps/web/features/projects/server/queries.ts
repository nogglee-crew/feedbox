import { prisma } from "@/lib/db";
import type { Issue, IssueStatus, Project, QaSession, Release } from "@/lib/types";

export interface IssueFilter {
  status?: IssueStatus;
  q?: string;
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
    where: {
      releaseId,
      status: filter.status,
      ...(filter.q
        ? {
            OR: [
              { memo: { contains: filter.q, mode: "insensitive" } },
              { pageUrl: { contains: filter.q, mode: "insensitive" } },
              { selector: { contains: filter.q, mode: "insensitive" } },
              { errorName: { contains: filter.q, mode: "insensitive" } },
              { errorCode: { contains: filter.q, mode: "insensitive" } },
              { errorMessage: { contains: filter.q, mode: "insensitive" } },
              { apiUrl: { contains: filter.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapIssue);
}
