import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ACTIVE_ORG_COOKIE, assertOwner } from "@/lib/orgs";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function createOrganizationForCurrentUser(name: string): Promise<never> {
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
  redirect("/projects");
}

export async function activateOrganizationForCurrentUser(orgId: string): Promise<never | void> {
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
  redirect("/projects");
}

export async function addOrganizationMember(input: {
  orgId: string;
  email: string;
  role: "owner" | "member";
}): Promise<void> {
  await assertOwner(input.orgId);
  await prisma.organizationMember.upsert({
    where: {
      orgId_email: {
        orgId: input.orgId,
        email: normalizeEmail(input.email),
      },
    },
    update: {
      role: input.role === "owner" ? "OWNER" : "MEMBER",
    },
    create: {
      orgId: input.orgId,
      email: normalizeEmail(input.email),
      role: input.role === "owner" ? "OWNER" : "MEMBER",
    },
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
