import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getUser, isAuthEnabled } from "./auth";
import { prisma } from "./db";
import type { Organization, OrgMember, OrgRole } from "./types";

export const ACTIVE_ORG_COOKIE = "feedbox-active-org";

export interface OrgMembershipSummary {
  org: Organization;
  role: OrgRole;
}

export interface OrgContext {
  org: Organization;
  role: OrgRole;
  orgs: Organization[];
  /** 내가 속한 모든 팀과 각 팀에서의 내 역할 */
  memberships: OrgMembershipSummary[];
  email: string;
}

function mapOrganization(row: {
  id: string;
  name: string;
  plan: "FREE" | "PRO";
  billingStatus: "UNPAID" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  accessOverride: "NONE" | "ADMIN" | "TEST";
  createdAt: Date;
}): Organization {
  return {
    id: row.id,
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

/**
 * 로그인 사용자의 조직 컨텍스트.
 * - 소속 조직 없음: "no-org"
 */
export const loadOrgContext = cache(async function loadOrgContext(): Promise<OrgContext | "no-org"> {
  if (!isAuthEnabled()) {
    throw new Error("Supabase Auth environment variables are required");
  }
  const user = await getUser();
  if (!user?.email) redirect("/login");

  const email = user.email.toLowerCase();
  if (!isDashboardEmailAllowed(email)) redirect("/login?denied=1");

  const rows = await prisma.organizationMember.findMany({
    where: {
      OR: [{ authUserId: user.id }, { email }],
    },
    include: { org: true },
    orderBy: { createdAt: "asc" },
  });
  if (rows.length === 0) return "no-org";

  if (rows.some((row) => row.authUserId === null)) {
    await prisma.organizationMember.updateMany({
      where: { email, authUserId: null },
      data: { authUserId: user.id },
    });
  }

  const activeId = (await cookies()).get(ACTIVE_ORG_COOKIE)?.value;
  const active = rows.find((row) => row.orgId === activeId) ?? rows[0];
  return {
    org: mapOrganization(active.org),
    role: active.role === "OWNER" ? "owner" : "member",
    orgs: rows.map((row) => mapOrganization(row.org)),
    memberships: rows.map((row) => ({
      org: mapOrganization(row.org),
      role: row.role === "OWNER" ? ("owner" as const) : ("member" as const),
    })),
    email,
  };
});

/** 조직이 필요한 페이지 가드. 조직이 없으면 온보딩으로 보낸다. */
export async function requireOrg(): Promise<OrgContext> {
  const ctx = await loadOrgContext();
  if (ctx === "no-org") redirect("/onboarding");
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
    user_id: row.authUserId,
    role: row.role === "OWNER" ? "owner" : "member",
    created_at: row.createdAt.toISOString(),
  }));
}

/** 현재 사용자가 해당 조직의 owner인지 검증한다 (액션용) */
export async function assertOwner(orgId: string): Promise<string> {
  const user = await getUser();
  if (!user?.email) redirect("/login");
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
