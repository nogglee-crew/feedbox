import { redirect } from "next/navigation";
import { cache } from "react";
import { getUser, isAuthEnabled } from "./auth";
import { prisma } from "./db";
import type { Organization, OrgMember, OrgRole } from "./types";

export interface OrgMembershipSummary {
  org: Organization;
  role: OrgRole;
}

export interface OrgContext {
  org: Organization;
  role: OrgRole;
  orgs: Organization[];
  memberships: OrgMembershipSummary[];
  email: string;
  /** 화면에 표시하는 이름. 계정 설정에서 바꾼 값이 있으면 그것, 없으면 구글 이름 */
  displayName: string;
}

function mapOrganization(row: {
  id: string;
  slug: string;
  name: string;
  plan: "FREE" | "PRO";
  billingStatus: "UNPAID" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  accessOverride: "NONE" | "ADMIN" | "TEST";
  createdAt: Date;
}): Organization {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    plan: row.plan,
    billing_status: row.billingStatus,
    access_override: row.accessOverride,
    created_at: row.createdAt.toISOString(),
  };
}

function isDashboardEmailAllowed(email: string): boolean {
  const allowed = (process.env.DASHBOARD_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.length === 0 || allowed.includes(email);
}

export const loadOrgContext = cache(async function loadOrgContext(): Promise<OrgContext | "no-org"> {
  if (!isAuthEnabled()) {
    throw new Error("Supabase Auth environment variables are required");
  }
  const user = await getUser();
  if (!user?.email) redirect("/auth/sign-in");

  const email = user.email.toLowerCase();
  if (!isDashboardEmailAllowed(email)) redirect("/?denied=1");

  const rows = await prisma.organizationMember.findMany({
    where: {
      OR: [{ authUserId: user.id }, { email }],
    },
    include: { org: true },
    orderBy: { createdAt: "asc" },
  });
  if (rows.length === 0) return "no-org";

  // Bind invited memberships and refresh the mutable Google avatar.
  // 이름은 계정 설정에서 바꿀 수 있으므로 비어 있을 때만 구글 이름으로 채운다.
  const needsSync = rows.some(
    (row) => row.authUserId === null || row.avatarUrl !== user.avatarUrl,
  );
  if (needsSync) {
    await prisma.organizationMember.updateMany({
      where: { OR: [{ authUserId: user.id }, { email }] },
      data: { authUserId: user.id, avatarUrl: user.avatarUrl },
    });
  }
  if (user.name && rows.some((row) => row.name === null)) {
    await prisma.organizationMember.updateMany({
      where: { OR: [{ authUserId: user.id }, { email }], name: null },
      data: { name: user.name },
    });
  }

  const active = rows[0];
  return {
    org: mapOrganization(active.org),
    role: active.role === "OWNER" ? "owner" : "member",
    orgs: rows.map((row) => mapOrganization(row.org)),
    memberships: rows.map((row) => ({
      org: mapOrganization(row.org),
      role: row.role === "OWNER" ? ("owner" as const) : ("member" as const),
    })),
    email,
    displayName: active.name ?? user.name ?? email,
  };
});

export async function requireOrg(): Promise<OrgContext> {
  const ctx = await loadOrgContext();
  if (ctx === "no-org") redirect("/onboarding");
  return ctx;
}

export const loadOrgContextBySlug = cache(async function loadOrgContextBySlug(
  orgSlug: string,
): Promise<OrgContext | "no-org" | "not-member"> {
  if (!isAuthEnabled()) {
    throw new Error("Supabase Auth environment variables are required");
  }
  const user = await getUser();
  if (!user?.email) redirect("/auth/sign-in");

  const email = user.email.toLowerCase();
  if (!isDashboardEmailAllowed(email)) redirect("/?denied=1");

  const rows = await prisma.organizationMember.findMany({
    where: {
      OR: [{ authUserId: user.id }, { email }],
    },
    include: { org: true },
    orderBy: { createdAt: "asc" },
  });
  if (rows.length === 0) return "no-org";

  const needsSync = rows.some(
    (row) => row.authUserId === null || row.avatarUrl !== user.avatarUrl,
  );
  if (needsSync) {
    await prisma.organizationMember.updateMany({
      where: { OR: [{ authUserId: user.id }, { email }] },
      data: { authUserId: user.id, avatarUrl: user.avatarUrl },
    });
  }
  if (user.name && rows.some((row) => row.name === null)) {
    await prisma.organizationMember.updateMany({
      where: { OR: [{ authUserId: user.id }, { email }], name: null },
      data: { name: user.name },
    });
  }

  const active = rows.find((row) => row.org.slug === orgSlug);
  if (!active) return "not-member";

  return {
    org: mapOrganization(active.org),
    role: active.role === "OWNER" ? "owner" : "member",
    orgs: rows.map((row) => mapOrganization(row.org)),
    memberships: rows.map((row) => ({
      org: mapOrganization(row.org),
      role: row.role === "OWNER" ? ("owner" as const) : ("member" as const),
    })),
    email,
    displayName: active.name ?? user.name ?? email,
  };
});

export async function requireOrgBySlug(orgSlug: string): Promise<OrgContext> {
  const ctx = await loadOrgContextBySlug(orgSlug);
  if (ctx === "no-org") redirect("/onboarding");
  if (ctx === "not-member") redirect("/projects");
  return ctx;
}

export async function listOrgMembers(orgId: string): Promise<OrgMember[]> {
  const rows = await prisma.organizationMember.findMany({
    where: { orgId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    org_id: row.orgId,
    email: row.email,
    name: row.name,
    avatar_url: row.avatarUrl,
    user_id: row.authUserId,
    role: row.role === "OWNER" ? "owner" : "member",
    created_at: row.createdAt.toISOString(),
  }));
}

export async function assertOwner(orgId: string): Promise<string> {
  const user = await getUser();
  if (!user?.email) redirect("/auth/sign-in");
  const email = user.email.toLowerCase();
  const membership = await prisma.organizationMember.findFirst({
    where: {
      orgId,
      OR: [{ authUserId: user.id }, { email }],
    },
    select: { role: true },
  });
  if (membership?.role !== "OWNER") throw new Error("조직 owner 권한이 필요합니다");
  return email;
}
