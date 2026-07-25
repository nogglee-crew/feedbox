import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { Prisma } from "@/lib/generated/prisma/client";
import { getUser } from "@/lib/auth";
import { deleteProjectScreenshots } from "@/features/issues/server/sdk-issues";
import { prisma } from "@/lib/db";
import { normalizeOrgSlug, validateOrgSlug } from "@/lib/org-slugs";
import { assertOwner } from "@/lib/orgs";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function createOrganizationForCurrentUser(name: string): Promise<{ slug: string }> {
  const user = await getUser();
  if (!user?.email) redirect("/auth/sign-in");

  const email = normalizeEmail(user.email);
  const id = randomUUID();
  const slug = id.slice(0, 8);
  const org = await prisma.organization.create({
    data: {
      id,
      name,
      slug,
      members: {
        create: {
          authUserId: user.id,
          email,
          role: "OWNER",
        },
      },
    },
  });

  return { slug: org.slug };
}

export async function findOrganizationForCurrentUser(orgId: string): Promise<{ slug: string } | null> {
  const user = await getUser();
  if (!user?.email) redirect("/auth/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: {
      orgId,
      OR: [
        { authUserId: user.id },
        { email: normalizeEmail(user.email) },
      ],
    },
    select: { org: { select: { slug: true } } },
  });
  return membership?.org ?? null;
}

export async function resolveOrganizationAfterSignIn(input: {
  authUserId: string;
  email: string;
  name: unknown;
  avatarUrl: unknown;
}): Promise<{ slug: string } | null> {
  const email = normalizeEmail(input.email);
  const membership = await prisma.organizationMember.findFirst({
    where: {
      OR: [{ authUserId: input.authUserId }, { email }],
    },
    include: { org: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) return null;

  const name = typeof input.name === "string" ? input.name : null;
  const avatarUrl = typeof input.avatarUrl === "string" ? input.avatarUrl : null;
  if (
    membership.authUserId === null ||
    membership.name !== name ||
    membership.avatarUrl !== avatarUrl
  ) {
    await prisma.organizationMember.updateMany({
      where: { OR: [{ authUserId: input.authUserId }, { email }] },
      data: {
        authUserId: input.authUserId,
        name,
        avatarUrl,
      },
    });
  }

  return { slug: membership.org.slug };
}

export async function renameOrganization(input: { orgId: string; name: string }): Promise<void> {
  const name = input.name.trim();
  if (!name) return;
  await assertOwner(input.orgId);
  await prisma.organization.update({ where: { id: input.orgId }, data: { name } });
}

export async function isOrganizationSlugAvailable(input: {
  orgId: string;
  slug: string;
}): Promise<{ available: boolean; slug: string; error: string | null }> {
  await assertOwner(input.orgId);
  const slug = normalizeOrgSlug(input.slug);
  const error = validateOrgSlug(slug);
  if (error) return { available: false, slug, error };

  const existing = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true },
  });
  return {
    available: !existing || existing.id === input.orgId,
    slug,
    error: existing && existing.id !== input.orgId ? "사용중인 주소입니다" : null,
  };
}

export async function updateOrganizationSlug(input: {
  orgId: string;
  slug: string;
}): Promise<{ slug: string }> {
  await assertOwner(input.orgId);
  const slug = normalizeOrgSlug(input.slug);
  const error = validateOrgSlug(slug);
  if (error) throw new Error(error);

  try {
    const org = await prisma.organization.update({
      where: { id: input.orgId },
      data: { slug },
      select: { slug: true },
    });
    return org;
  } catch (error_) {
    if (error_ instanceof Prisma.PrismaClientKnownRequestError && error_.code === "P2002") {
      throw new Error("이미 사용 중인 팀 URL입니다");
    }
    throw error_;
  }
}

export async function deleteOrganization(input: {
  orgId: string;
  confirmName: string;
}): Promise<void> {
  await assertOwner(input.orgId);

  const org = await prisma.organization.findUnique({
    where: { id: input.orgId },
    select: { name: true, projects: { select: { id: true } } },
  });
  if (!org) throw new Error("팀을 찾을 수 없습니다");
  // 되돌릴 수 없는 작업이라 이름 확인을 서버에서도 다시 검사한다
  if (input.confirmName.trim() !== org.name) {
    throw new Error("팀 이름이 일치하지 않습니다");
  }

  // 프로젝트·릴리즈·세션·이슈는 스키마의 cascade로 함께 지워진다
  await prisma.organization.delete({ where: { id: input.orgId } });
  // 스토리지는 DB 트랜잭션 밖이라 뒤에 둔다. 실패해도 고아 파일만 남는다
  for (const project of org.projects) {
    await deleteProjectScreenshots(project.id);
  }
}

export async function addOrganizationMember(input: {
  orgId: string;
  email: string;
  role: "owner" | "member";
}): Promise<void> {
  await assertOwner(input.orgId);
  const email = normalizeEmail(input.email);
  const role = input.role === "owner" ? "OWNER" : "MEMBER";

  await prisma.$transaction(async (tx) => {
    const existing = await tx.organizationMember.findUnique({
      where: { orgId_email: { orgId: input.orgId, email } },
      select: { id: true, role: true },
    });

    // Every organization must retain at least one owner.
    if (existing?.role === "OWNER" && role === "MEMBER") {
      const ownerCount = await tx.organizationMember.count({
        where: { orgId: input.orgId, role: "OWNER" },
      });
      if (ownerCount <= 1) {
        throw new Error("마지막 owner는 member로 변경할 수 없습니다");
      }
    }

    if (existing) {
      await tx.organizationMember.update({ where: { id: existing.id }, data: { role } });
    } else {
      await tx.organizationMember.create({ data: { orgId: input.orgId, email, role } });
    }
  });
}

/**
 * 소유권 이전: 대상을 owner로 올리고, 요청한 현재 owner를 member로 강등한다.
 * 팀은 owner 1명을 유지하므로 승격과 강등을 한 트랜잭션에서 처리한다.
 */
export async function transferOwnership(input: { orgId: string; email: string }): Promise<void> {
  const callerEmail = await assertOwner(input.orgId);
  const target = normalizeEmail(input.email);
  if (target === callerEmail) {
    throw new Error("이미 owner입니다");
  }

  await prisma.$transaction(async (tx) => {
    // 대상 승격 (초대만 된 이메일이면 새로 만든다)
    await tx.organizationMember.upsert({
      where: { orgId_email: { orgId: input.orgId, email: target } },
      update: { role: "OWNER" },
      create: { orgId: input.orgId, email: target, role: "OWNER" },
    });
    // 요청자 강등
    await tx.organizationMember.updateMany({
      where: { orgId: input.orgId, email: callerEmail },
      data: { role: "MEMBER" },
    });
  });
}

export async function removeOrganizationMember(input: {
  orgId: string;
  memberId: string;
}): Promise<void> {
  await assertOwner(input.orgId);

  await prisma.$transaction(async (tx) => {
    const member = await tx.organizationMember.findFirst({
      where: { id: input.memberId, orgId: input.orgId },
      select: { id: true, role: true },
    });
    if (!member) return;

    if (member.role === "OWNER") {
      const ownerCount = await tx.organizationMember.count({
        where: { orgId: input.orgId, role: "OWNER" },
      });
      if (ownerCount <= 1) {
        throw new Error("마지막 owner는 삭제할 수 없습니다");
      }
    }

    await tx.organizationMember.delete({ where: { id: member.id } });
  });
}
