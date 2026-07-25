import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ACTIVE_ORG_COOKIE, assertOwner } from "@/lib/orgs";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function createOrganizationForCurrentUser(name: string): Promise<void> {
  const user = await getUser();
  if (!user?.email) redirect("/login");

  const email = normalizeEmail(user.email);
  const org = await prisma.organization.create({
    data: {
      name,
      members: {
        create: {
          authUserId: user.id,
          email,
          role: "OWNER",
        },
      },
    },
  });

  (await cookies()).set(ACTIVE_ORG_COOKIE, org.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function activateOrganizationForCurrentUser(orgId: string): Promise<void> {
  const user = await getUser();
  if (!user?.email) redirect("/login");

  const membership = await prisma.organizationMember.findFirst({
    where: {
      orgId,
      OR: [
        { authUserId: user.id },
        { email: normalizeEmail(user.email) },
      ],
    },
    select: { id: true },
  });
  if (!membership) return;

  (await cookies()).set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function renameOrganization(input: { orgId: string; name: string }): Promise<void> {
  const name = input.name.trim();
  if (!name) return;
  await assertOwner(input.orgId);
  await prisma.organization.update({ where: { id: input.orgId }, data: { name } });
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
