import { prisma } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

export interface SignupUser {
  id: string;
  email: string;
  provider: string | null;
  createdAt: Date;
  lastSignInAt: Date | null;
}

/**
 * 가입 회원은 Supabase Auth에만 있고 Prisma에는 없다.
 * 팀을 만들지 않은 회원은 `organization_members`에 행이 없어 여기서만 보인다.
 */
export async function listSignups(): Promise<SignupUser[]> {
  const client = supabaseAdmin();
  const users: SignupUser[] = [];
  const perPage = 1000;

  for (let page = 1; ; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Supabase 회원 목록 조회 실패: ${error.message}`);

    for (const user of data.users) {
      users.push({
        id: user.id,
        email: user.email ?? "(이메일 없음)",
        provider: user.app_metadata?.provider ?? null,
        createdAt: new Date(user.created_at),
        lastSignInAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
      });
    }
    if (data.users.length < perPage) break;
  }

  return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export type OrgRole = "OWNER" | "MEMBER";

export interface MembershipRow {
  authUserId: string | null;
  email: string;
  role: OrgRole;
  orgName: string;
  orgSlug: string;
  joinedAt: Date;
  projectCount: number;
  issueCount: number;
  firstProjectAt: Date | null;
  firstIssueAt: Date | null;
}

/**
 * 팀 소속별 활성화 상태.
 * 소유자만 보면 초대로 합류한 회원이 미활성으로 잡히므로 역할을 가리지 않고 가져온다.
 * 이슈는 프로젝트를 거쳐야 해서 Prisma의 중첩 _count로는 셀 수 없다.
 */
export async function listMembershipActivity(): Promise<MembershipRow[]> {
  return prisma.$queryRaw<MembershipRow[]>`
    SELECT
      m.auth_user_id            AS "authUserId",
      m.email                   AS "email",
      m.role::text              AS "role",
      o.name                    AS "orgName",
      o.slug                    AS "orgSlug",
      m.created_at              AS "joinedAt",
      COUNT(DISTINCT p.id)::int AS "projectCount",
      COUNT(DISTINCT i.id)::int AS "issueCount",
      MIN(p.created_at)         AS "firstProjectAt",
      MIN(i.created_at)         AS "firstIssueAt"
    FROM organization_members m
    JOIN organizations o ON o.id = m.org_id
    LEFT JOIN projects p ON p.org_id = m.org_id
    LEFT JOIN issues i ON i.project_id = p.id
    GROUP BY m.id, o.id
  `;
}

export interface UserActivity {
  authUserId: string;
  orgs: { name: string; slug: string; role: OrgRole }[];
  ownsOrg: boolean;
  projectCount: number;
  issueCount: number;
  firstJoinedAt: Date;
  firstProjectAt: Date | null;
  firstIssueAt: Date | null;
}

/**
 * 소속 행은 팀 단위라 한 사람이 여러 팀에 속하면 여러 번 나온다. 회원 단위로 접는다.
 * 초대만 받고 아직 로그인하지 않은 멤버는 `auth_user_id`가 비어 있어 이메일로도 맞춘다.
 */
export function summarizeMembershipsByUser(
  rows: MembershipRow[],
  signups: SignupUser[],
): Map<string, UserActivity> {
  const userIdByEmail = new Map(signups.map((user) => [user.email.toLowerCase(), user.id]));
  const signupIds = new Set(signups.map((user) => user.id));
  const byUser = new Map<string, UserActivity>();
  const earliest = (a: Date | null, b: Date | null): Date | null => {
    if (!a) return b;
    if (!b) return a;
    return a < b ? a : b;
  };

  for (const row of rows) {
    const userId =
      row.authUserId && signupIds.has(row.authUserId)
        ? row.authUserId
        : userIdByEmail.get(row.email.toLowerCase());
    // 가입 계정과 연결되지 않은 초대 행은 회원 퍼널의 대상이 아니다
    if (!userId) continue;

    const existing = byUser.get(userId);
    if (!existing) {
      byUser.set(userId, {
        authUserId: userId,
        orgs: [{ name: row.orgName, slug: row.orgSlug, role: row.role }],
        ownsOrg: row.role === "OWNER",
        projectCount: row.projectCount,
        issueCount: row.issueCount,
        firstJoinedAt: row.joinedAt,
        firstProjectAt: row.firstProjectAt,
        firstIssueAt: row.firstIssueAt,
      });
      continue;
    }

    existing.orgs.push({ name: row.orgName, slug: row.orgSlug, role: row.role });
    existing.ownsOrg = existing.ownsOrg || row.role === "OWNER";
    existing.projectCount += row.projectCount;
    existing.issueCount += row.issueCount;
    // 전환 소요 기간은 가장 빠른 시도를 기준으로 본다
    existing.firstJoinedAt = earliest(existing.firstJoinedAt, row.joinedAt) as Date;
    existing.firstProjectAt = earliest(existing.firstProjectAt, row.firstProjectAt);
    existing.firstIssueAt = earliest(existing.firstIssueAt, row.firstIssueAt);
  }

  return byUser;
}

/** 두 시각 사이의 일수. 데이터 정합이 깨진 경우를 음수로 흘려보내지 않는다. */
function elapsedDays(from: Date, to: Date): number {
  return Math.max(0, (to.getTime() - from.getTime()) / 86_400_000);
}

/**
 * 전환 소요 기간의 중앙값.
 * 표본이 적을 때 평균은 이상치 하나에 끌려가므로 중앙값을 쓴다.
 */
export function medianTransitionDays(
  pairs: { from: Date | null | undefined; to: Date | null | undefined }[],
): number | null {
  const values = pairs
    .filter((pair): pair is { from: Date; to: Date } => Boolean(pair.from && pair.to))
    .map((pair) => elapsedDays(pair.from, pair.to))
    .sort((a, b) => a - b);

  if (values.length === 0) return null;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 === 1 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
}

export interface OrgRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  billingStatus: string;
  accessOverride: string;
  memberCount: number;
  projectCount: number;
  issueCount: number;
  lastIssueAt: Date | null;
  createdAt: Date;
}

/** 팀 목록. 결제 상태와 실제 사용량을 같이 봐야 활성 고객을 가려낼 수 있다. */
export async function listOrgs(): Promise<OrgRow[]> {
  return prisma.$queryRaw<OrgRow[]>`
    SELECT
      o.id                      AS "id",
      o.name                    AS "name",
      o.slug                    AS "slug",
      o.plan::text              AS "plan",
      o.billing_status::text    AS "billingStatus",
      o.access_override::text   AS "accessOverride",
      COUNT(DISTINCT m.id)::int AS "memberCount",
      COUNT(DISTINCT p.id)::int AS "projectCount",
      COUNT(DISTINCT i.id)::int AS "issueCount",
      MAX(i.created_at)         AS "lastIssueAt",
      o.created_at              AS "createdAt"
    FROM organizations o
    LEFT JOIN organization_members m ON m.org_id = o.id
    LEFT JOIN projects p ON p.org_id = o.id
    LEFT JOIN issues i ON i.project_id = p.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
}

export interface ProjectRow {
  id: string;
  name: string;
  projectKey: string;
  baseUrl: string | null;
  orgName: string;
  orgSlug: string;
  releaseCount: number;
  sessionCount: number;
  issueCount: number;
  openIssueCount: number;
  lastIssueAt: Date | null;
  createdAt: Date;
}

/** 프로젝트 목록. 배포 URL이 비어 있으면 SDK를 아직 붙이지 않았을 가능성이 높다. */
export async function listProjects(): Promise<ProjectRow[]> {
  return prisma.$queryRaw<ProjectRow[]>`
    SELECT
      p.id                       AS "id",
      p.name                     AS "name",
      p.project_key              AS "projectKey",
      p.base_url                 AS "baseUrl",
      o.name                     AS "orgName",
      o.slug                     AS "orgSlug",
      COUNT(DISTINCT r.id)::int  AS "releaseCount",
      COUNT(DISTINCT s.id)::int  AS "sessionCount",
      COUNT(DISTINCT i.id)::int  AS "issueCount",
      COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'OPEN')::int AS "openIssueCount",
      MAX(i.created_at)          AS "lastIssueAt",
      p.created_at               AS "createdAt"
    FROM projects p
    JOIN organizations o ON o.id = p.org_id
    LEFT JOIN releases r ON r.project_id = p.id
    LEFT JOIN qa_sessions s ON s.project_id = p.id
    LEFT JOIN issues i ON i.project_id = p.id
    GROUP BY p.id, o.id
    ORDER BY p.created_at DESC
  `;
}

export interface IssueRow {
  id: number;
  status: string;
  memo: string;
  hasScreenshot: boolean;
  createdAt: Date;
}

/**
 * 이슈 목록. 어떤 내용이 접수되는지 훑는 용도라 본문과 접수 시각만 가져온다.
 * 전량을 한 화면에 올릴 이유는 없어 최근 것부터 자른다.
 */
export async function listRecentIssues(limit: number): Promise<IssueRow[]> {
  const rows = await prisma.issue.findMany({
    select: { id: true, status: true, memo: true, screenshotUrl: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    memo: row.memo,
    hasScreenshot: row.screenshotUrl !== null,
    createdAt: row.createdAt,
  }));
}

export interface SubscriberRow {
  email: string;
  orgName: string | null;
  createdAt: Date;
}

export async function listSubscribers(): Promise<SubscriberRow[]> {
  const rows = await prisma.subscriptionInterest.findMany({
    select: { email: true, createdAt: true, org: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    email: row.email,
    orgName: row.org?.name ?? null,
    createdAt: row.createdAt,
  }));
}

export interface PlatformTotals {
  orgs: number;
  projects: number;
  releases: number;
  qaSessions: number;
  issues: number;
  subscriptionInterests: number;
}

export async function loadPlatformTotals(): Promise<PlatformTotals> {
  const [orgs, projects, releases, qaSessions, issues, subscriptionInterests] = await Promise.all([
    prisma.organization.count(),
    prisma.project.count(),
    prisma.release.count(),
    prisma.qaSession.count(),
    prisma.issue.count(),
    prisma.subscriptionInterest.count(),
  ]);
  return { orgs, projects, releases, qaSessions, issues, subscriptionInterests };
}

export interface EventCount {
  name: string;
  total: number;
  users: number;
}

/** 자체 수집 이벤트 현황. 계측이 실제로 들어오는지 확인하는 용도도 겸한다. */
export async function loadEventCounts(sinceDays: number): Promise<EventCount[]> {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
  return prisma.$queryRaw<EventCount[]>`
    SELECT
      name,
      COUNT(*)::int              AS total,
      COUNT(DISTINCT anon_id)::int AS users
    FROM analytics_events
    WHERE created_at >= ${since}
    GROUP BY name
    ORDER BY total DESC
  `;
}

export interface DailyCount {
  day: string;
  count: number;
}

/** 최근 N일 일별 집계. 이벤트가 없는 날도 0으로 채워 그래프가 끊기지 않게 한다. */
export function toDailySeries(dates: Date[], days: number): DailyCount[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    buckets.set(date.toISOString().slice(0, 10), 0);
  }

  for (const date of dates) {
    const key = date.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets].map(([day, count]) => ({ day, count }));
}
