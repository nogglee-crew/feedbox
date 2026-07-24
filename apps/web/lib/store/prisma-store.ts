import { randomBytes, randomUUID } from "node:crypto";
import { prisma } from "../db";
import { supabaseAdmin } from "../supabase";
import type { Issue, Project, QaSession, Release } from "../types";
import type { IssueFilter, NewIssue, Store } from "./types";

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
  memo: string;
  screenshotUrl: string | null;
  status: "OPEN" | "IN_PROGRESS" | "DONE" | "CLOSED";
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
    memo: row.memo,
    screenshot_url: row.screenshotUrl,
    status: row.status,
    assignee: row.assignee,
    created_at: iso(row.createdAt),
  };
}

export const prismaStore: Store = {
  async listProjects(orgId) {
    const rows = await prisma.project.findMany({
      where: orgId ? { orgId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapProject);
  },

  async getProject(id) {
    const row = await prisma.project.findUnique({ where: { id } });
    return row ? mapProject(row) : null;
  },

  async getProjectByKey(projectKey) {
    const row = await prisma.project.findUnique({ where: { projectKey } });
    return row ? mapProject(row) : null;
  },

  async createProject(input) {
    await prisma.project.create({
      data: {
        orgId: input.org_id,
        name: input.name,
        projectKey: input.project_key,
        apiKey: randomBytes(24).toString("hex"),
        baseUrl: input.base_url,
      },
    });
  },

  async updateProject(id, patch) {
    await prisma.project.update({
      where: { id },
      data: { baseUrl: patch.base_url },
    });
  },

  async deleteProject(id) {
    await prisma.project.delete({ where: { id } });
  },

  async listReleases(projectId) {
    const rows = await prisma.release.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapRelease);
  },

  async getRelease(id) {
    const row = await prisma.release.findUnique({ where: { id } });
    return row ? mapRelease(row) : null;
  },

  async createRelease(projectId, version) {
    await prisma.release.create({ data: { projectId, version } });
  },

  async setReleaseStatus(id, status) {
    await prisma.release.update({ where: { id }, data: { status } });
  },

  async listSessions(releaseId) {
    const rows = await prisma.qaSession.findMany({
      where: { releaseId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapSession);
  },

  async getSessionByToken(token) {
    const row = await prisma.qaSession.findUnique({ where: { token } });
    return row ? mapSession(row) : null;
  },

  async createSession(input) {
    await prisma.qaSession.create({
      data: {
        projectId: input.project_id,
        releaseId: input.release_id,
        createdBy: input.created_by,
        expiresAt: new Date(input.expires_at),
        token: randomBytes(24).toString("base64url"),
      },
    });
  },

  async revokeSession(id) {
    await prisma.qaSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },

  async listIssues(releaseId, filter: IssueFilter) {
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
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapIssue);
  },

  async createIssue(input: NewIssue) {
    const row = await prisma.issue.create({
      data: {
        projectId: input.project_id,
        releaseId: input.release_id,
        sessionId: input.session_id,
        pageUrl: input.page_url,
        selector: input.selector,
        elementText: input.element_text,
        viewportWidth: input.viewport_width,
        viewportHeight: input.viewport_height,
        browser: input.browser,
        memo: input.memo,
        screenshotUrl: input.screenshot_url,
      },
      select: { id: true },
    });
    return row;
  },

  async updateIssue(id, patch) {
    await prisma.issue.update({
      where: { id },
      data: patch,
    });
  },

  async saveScreenshot(projectId, png) {
    const storage = supabaseAdmin().storage;
    const path = `${projectId}/${randomUUID()}.png`;
    const { error } = await storage
      .from("screenshots")
      .upload(path, png, { contentType: "image/png" });
    if (error) return null;
    return storage.from("screenshots").getPublicUrl(path).data.publicUrl;
  },
};
