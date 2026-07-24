import { randomBytes } from "node:crypto";
import { projectLimit } from "@/features/billing/domain/entitlements";
import { prisma } from "@/lib/db";
import { requireOrg } from "@/lib/orgs";
import { ISSUE_STATUSES, type IssueStatus } from "@/lib/types";

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "project";
}

async function requireProject(projectId: string) {
  const ctx = await requireOrg();
  if (!ctx) throw new Error("Supabase Auth 환경변수가 필요합니다");

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: ctx.org.id },
  });
  if (!project) throw new Error("프로젝트를 찾을 수 없습니다");
  return { ctx, project };
}

export async function createProjectForCurrentOrg(input: {
  name: string;
  baseUrl: string | null;
}): Promise<void> {
  const ctx = await requireOrg();
  if (!ctx) throw new Error("Supabase Auth 환경변수가 필요합니다");

  const baseKey = slugify(input.name);
  await prisma.$transaction(
    async (tx) => {
      const count = await tx.project.count({ where: { orgId: ctx.org.id } });
      if (count >= projectLimit(ctx.org)) {
        throw new Error("현재 플랜의 프로젝트 한도에 도달했습니다");
      }

      const existing = await tx.project.findUnique({
        where: { projectKey: baseKey },
        select: { id: true },
      });
      await tx.project.create({
        data: {
          orgId: ctx.org.id,
          name: input.name,
          projectKey: existing ? `${baseKey}-${randomBytes(3).toString("hex")}` : baseKey,
          apiKey: randomBytes(24).toString("hex"),
          baseUrl: input.baseUrl,
        },
      });
    },
    { isolationLevel: "Serializable" },
  );
}

export async function deleteProjectForCurrentOrg(projectId: string): Promise<void> {
  await requireProject(projectId);
  await prisma.project.delete({ where: { id: projectId } });
}

export async function updateProjectBaseUrlForCurrentOrg(
  projectId: string,
  baseUrl: string | null,
): Promise<void> {
  await requireProject(projectId);
  await prisma.project.update({ where: { id: projectId }, data: { baseUrl } });
}

export async function createReleaseForCurrentOrg(
  projectId: string,
  version: string,
): Promise<void> {
  await requireProject(projectId);
  await prisma.release.create({ data: { projectId, version } });
}

export async function setReleaseStatusForCurrentOrg(input: {
  projectId: string;
  releaseId: string;
  status: "OPEN" | "CLOSED";
}): Promise<void> {
  await requireProject(input.projectId);
  const release = await prisma.release.findFirst({
    where: { id: input.releaseId, projectId: input.projectId },
    select: { id: true },
  });
  if (!release) throw new Error("릴리즈를 찾을 수 없습니다");
  await prisma.release.update({ where: { id: release.id }, data: { status: input.status } });
}

export async function createSessionForCurrentOrg(input: {
  projectId: string;
  releaseId: string;
  createdBy: string | null;
  expiresAt: Date;
}): Promise<void> {
  await requireProject(input.projectId);
  const release = await prisma.release.findFirst({
    where: { id: input.releaseId, projectId: input.projectId },
    select: { id: true, status: true },
  });
  if (!release) throw new Error("릴리즈를 찾을 수 없습니다");
  if (release.status !== "OPEN") throw new Error("종료된 릴리즈에는 세션을 만들 수 없습니다");

  await prisma.qaSession.create({
    data: {
      projectId: input.projectId,
      releaseId: input.releaseId,
      createdBy: input.createdBy,
      expiresAt: input.expiresAt,
      token: randomBytes(24).toString("base64url"),
    },
  });
}

export async function revokeSessionForCurrentOrg(input: {
  projectId: string;
  releaseId: string;
  sessionId: string;
}): Promise<void> {
  await requireProject(input.projectId);
  const session = await prisma.qaSession.findFirst({
    where: {
      id: input.sessionId,
      projectId: input.projectId,
      releaseId: input.releaseId,
    },
    select: { id: true },
  });
  if (!session) throw new Error("세션을 찾을 수 없습니다");
  await prisma.qaSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
}

export async function updateIssueForCurrentOrg(
  issueId: number,
  patch: { status?: string; assignee?: string | null },
): Promise<void> {
  const ctx = await requireOrg();
  if (!ctx) throw new Error("Supabase Auth 환경변수가 필요합니다");

  const issue = await prisma.issue.findFirst({
    where: { id: issueId, project: { orgId: ctx.org.id } },
    select: { id: true },
  });
  if (!issue) throw new Error("이슈를 찾을 수 없습니다");

  if (patch.assignee) {
    const assignee = await prisma.organizationMember.findUnique({
      where: {
        orgId_email: {
          orgId: ctx.org.id,
          email: patch.assignee.toLowerCase(),
        },
      },
      select: { id: true },
    });
    if (!assignee) throw new Error("조직 멤버만 담당자로 지정할 수 있습니다");
  }

  const status = ISSUE_STATUSES.includes(patch.status as IssueStatus)
    ? (patch.status as IssueStatus)
    : undefined;
  if (patch.status !== undefined && status === undefined) {
    throw new Error("유효하지 않은 이슈 상태입니다");
  }
  await prisma.issue.update({
    where: { id: issue.id },
    data: {
      status,
      assignee: patch.assignee?.toLowerCase() ?? patch.assignee,
    },
  });
}
