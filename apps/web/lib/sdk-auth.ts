import { NextResponse } from "next/server";
import { prisma } from "./db";
import type { Project, QaSession, Release } from "./types";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function corsJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export interface SdkContext {
  project: Project;
  session: QaSession;
  release: Release;
}

export async function authenticateSdk(body: {
  projectKey?: string;
  apiKey?: string;
  token?: string;
}): Promise<{ context?: SdkContext; error?: NextResponse }> {
  const { projectKey, apiKey, token } = body;
  if (!projectKey || !apiKey || !token) {
    return { error: corsJson({ error: "projectKey, apiKey, token이 필요합니다" }, 400) };
  }

  const row = await prisma.qaSession.findUnique({
    where: { token },
    include: {
      project: true,
      release: true,
    },
  });
  if (
    !row ||
    row.project.projectKey !== projectKey ||
    row.project.apiKey !== apiKey ||
    row.projectId !== row.project.id
  ) {
    return { error: corsJson({ error: "프로젝트 인증에 실패했습니다" }, 401) };
  }

  if (row.revokedAt) {
    return { error: corsJson({ error: "종료된 QA 세션입니다" }, 401) };
  }
  if (row.expiresAt.getTime() < Date.now()) {
    return { error: corsJson({ error: "만료된 QA 세션입니다" }, 401) };
  }

  if (row.release.status !== "OPEN") {
    return { error: corsJson({ error: "종료된 릴리즈입니다" }, 401) };
  }

  const project: Project = {
    id: row.project.id,
    org_id: row.project.orgId,
    name: row.project.name,
    project_key: row.project.projectKey,
    api_key: row.project.apiKey,
    base_url: row.project.baseUrl,
    created_at: row.project.createdAt.toISOString(),
  };
  const session: QaSession = {
    id: row.id,
    token: row.token,
    project_id: row.projectId,
    release_id: row.releaseId,
    created_by: row.createdBy,
    expires_at: row.expiresAt.toISOString(),
    revoked_at: null,
    created_at: row.createdAt.toISOString(),
  };
  const release: Release = {
    id: row.release.id,
    project_id: row.release.projectId,
    version: row.release.version,
    status: row.release.status,
    created_at: row.release.createdAt.toISOString(),
  };

  return { context: { project, session, release } };
}
