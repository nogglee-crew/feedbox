import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type {
  IssueComment,
  IssueCommentAuthor,
  IssueCommentSummary,
  IssueCommentViewer,
} from "@/lib/types";

/** 펼쳤을 때 처음 보여주는 최근 코멘트 수. 더 오래된 건 "이전 코멘트 보기"로 위로 확장한다 */
export const COMMENT_PAGE_SIZE = 5;
const MAX_COMMENT_LENGTH = 2000;
const RATE_LIMIT_PER_MINUTE = 10;

export interface IssueCommentPage {
  comments: IssueComment[];
  /** 아직 불러오지 않은 이전 코멘트 수 */
  olderCount: number;
}

interface CommentRow {
  id: number;
  issueId: number;
  guestKey: string | null;
  authorUserId: string | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  body: string;
  createdAt: Date;
  issue: { sessionId: string | null };
}

const COMMENT_INCLUDE = { issue: { select: { sessionId: true } } } as const;

/**
 * 요청자 관점. mine/deletable 판정에 쓴다.
 * 익명 테스터는 guestKey 일치(best-effort — 키가 유실되면 권한도 사라진다),
 * 멤버는 authorUserId 일치, 조직 멤버는 남의 코멘트도 삭제할 수 있다.
 */
interface CommentViewerContext {
  userId: string | null;
  isOrgMember: boolean;
  guestKey: string | null;
}

function testerLabel(index: number): string {
  // A~Z 이후는 숫자로 잇는다. 한 세션에 그만큼 모일 일은 사실상 없다
  return index < 26 ? `테스터 ${String.fromCharCode(65 + index)}` : `테스터 ${index + 1}`;
}

/**
 * 세션 안에서 guestKey → "테스터 A/B" 라벨 매핑. 키는 `${sessionId}:${guestKey}`.
 * 첫 코멘트 시각 순서로 매기므로 새 테스터가 와도 기존 라벨은 바뀌지 않는다.
 */
async function getTesterLabels(sessionIds: (string | null)[]): Promise<Map<string, string>> {
  const ids = [...new Set(sessionIds.filter((id): id is string => id !== null))];
  if (ids.length === 0) return new Map();

  const rows = await prisma.issueComment.findMany({
    where: { guestKey: { not: null }, issue: { sessionId: { in: ids } } },
    select: { guestKey: true, issue: { select: { sessionId: true } } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  const labels = new Map<string, string>();
  const counters = new Map<string, number>();
  for (const row of rows) {
    const sessionId = row.issue.sessionId;
    if (!sessionId || !row.guestKey) continue;
    const key = `${sessionId}:${row.guestKey}`;
    if (labels.has(key)) continue;
    const index = counters.get(sessionId) ?? 0;
    counters.set(sessionId, index + 1);
    labels.set(key, testerLabel(index));
  }
  return labels;
}

function mapComment(
  row: CommentRow,
  labels: Map<string, string>,
  viewer: CommentViewerContext,
): IssueComment {
  const author: IssueCommentAuthor =
    row.guestKey === null
      ? { kind: "member", name: row.authorName ?? "알 수 없음", avatar_url: row.authorAvatarUrl }
      : {
          kind: "tester",
          label: labels.get(`${row.issue.sessionId}:${row.guestKey}`) ?? "테스터",
        };
  const mine =
    row.guestKey !== null
      ? viewer.guestKey !== null && row.guestKey === viewer.guestKey
      : row.authorUserId !== null && row.authorUserId === viewer.userId;
  return {
    id: row.id,
    issue_id: row.issueId,
    author,
    body: row.body,
    created_at: row.createdAt.toISOString(),
    mine,
    deletable: mine || viewer.isOrgMember,
  };
}

function sanitizeBody(body: string): string {
  const trimmed = body.trim().slice(0, MAX_COMMENT_LENGTH);
  if (!trimmed) throw new Error("내용을 입력해 주세요");
  return trimmed;
}

/** 이슈 id 집합의 코멘트 수 + 최신 한 건. 호출부가 이슈 소유 검증을 마친 뒤 쓴다 */
async function getCommentSummaries(
  issueIds: number[],
  sessionIds: (string | null)[],
  viewer: CommentViewerContext,
): Promise<Record<number, IssueCommentSummary>> {
  const summaries: Record<number, IssueCommentSummary> = {};
  for (const id of issueIds) summaries[id] = { count: 0, latest: null };
  if (issueIds.length === 0) return summaries;

  const [counts, latest, labels] = await Promise.all([
    prisma.issueComment.groupBy({
      by: ["issueId"],
      where: { issueId: { in: issueIds } },
      _count: { _all: true },
    }),
    prisma.issueComment.findMany({
      where: { issueId: { in: issueIds } },
      orderBy: [{ issueId: "asc" }, { createdAt: "desc" }, { id: "desc" }],
      distinct: ["issueId"],
      include: COMMENT_INCLUDE,
    }),
    getTesterLabels(sessionIds),
  ]);

  for (const row of counts) {
    summaries[row.issueId] = { count: row._count._all, latest: null };
  }
  for (const row of latest) {
    const summary = summaries[row.issueId];
    if (summary) summary.latest = mapComment(row, labels, viewer);
  }
  return summaries;
}

/** 시간순(오래된 것 위) 페이지. before는 이미 불러온 것 중 가장 오래된 코멘트 id */
async function getCommentPage(
  issueId: number,
  sessionId: string | null,
  viewer: CommentViewerContext,
  before?: number | null,
): Promise<IssueCommentPage> {
  const where = { issueId, ...(before ? { id: { lt: before } } : {}) };
  const [rows, olderCount, labels] = await Promise.all([
    prisma.issueComment.findMany({
      where,
      orderBy: { id: "desc" },
      take: COMMENT_PAGE_SIZE,
      include: COMMENT_INCLUDE,
    }),
    prisma.issueComment.count({ where }),
    getTesterLabels([sessionId]),
  ]);
  return {
    comments: rows.reverse().map((row) => mapComment(row, labels, viewer)),
    olderCount: Math.max(0, olderCount - rows.length),
  };
}

/** 요청 쿠키의 로그인 유저가 이 조직 멤버면 표시용 프로필을 돌려준다 */
async function getOrgMemberProfile(
  orgId: string,
): Promise<{ userId: string; name: string; avatarUrl: string | null } | null> {
  const user = await getUser();
  if (!user) return null;
  const membership = await prisma.organizationMember.findFirst({
    where: {
      orgId,
      OR: [{ authUserId: user.id }, { email: user.email.toLowerCase() }],
    },
    select: { name: true, email: true, avatarUrl: true },
  });
  if (!membership) return null;
  return {
    userId: user.id,
    name: user.name ?? membership.name ?? membership.email,
    avatarUrl: user.avatarUrl ?? membership.avatarUrl,
  };
}

// ── 공개 보드 (세션 토큰 인가) ──────────────────────────────────────────────

interface BoardSession {
  id: string;
  orgId: string;
  active: boolean;
}

async function getBoardSession(token: string): Promise<BoardSession | null> {
  const row = await prisma.qaSession.findUnique({
    where: { token },
    select: {
      id: true,
      revokedAt: true,
      expiresAt: true,
      project: { select: { orgId: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    orgId: row.project.orgId,
    active: !row.revokedAt && row.expiresAt.getTime() >= Date.now(),
  };
}

async function getBoardViewerContext(
  orgId: string,
  guestKey?: string | null,
): Promise<CommentViewerContext> {
  const member = await getOrgMemberProfile(orgId);
  return {
    userId: member?.userId ?? null,
    isOrgMember: member !== null,
    guestKey: guestKey?.trim() || null,
  };
}

/** 보드에 보이는 이슈인지 — 그 세션에서 등록된 이슈만 코멘트 대상이다 */
async function requireBoardIssue(session: BoardSession, issueId: number): Promise<void> {
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, sessionId: session.id },
    select: { id: true },
  });
  if (!issue) throw new Error("이슈를 찾을 수 없습니다");
}

/** 코멘트가 이 보드(세션)의 이슈에 달린 게 맞는지 확인하고 돌려준다 */
async function requireBoardComment(session: BoardSession, commentId: number): Promise<CommentRow> {
  const row = await prisma.issueComment.findFirst({
    where: { id: commentId, issue: { sessionId: session.id } },
    include: COMMENT_INCLUDE,
  });
  if (!row) throw new Error("코멘트를 찾을 수 없습니다");
  return row;
}

/** 보드 카드 접힌 상태용 — 이슈별 코멘트 수 + 최신 한 건 */
export async function getBoardCommentSummaries(
  token: string,
  issueIds: number[],
): Promise<Record<number, IssueCommentSummary>> {
  const session = await getBoardSession(token);
  if (!session || issueIds.length === 0) return {};

  const [owned, viewer] = await Promise.all([
    prisma.issue.findMany({
      where: { id: { in: issueIds }, sessionId: session.id },
      select: { id: true },
    }),
    getBoardViewerContext(session.orgId),
  ]);
  return getCommentSummaries(
    owned.map((issue) => issue.id),
    [session.id],
    viewer,
  );
}

export async function listBoardIssueComments(input: {
  token: string;
  issueId: number;
  before?: number | null;
  guestKey?: string | null;
}): Promise<IssueCommentPage> {
  const session = await getBoardSession(input.token);
  if (!session) return { comments: [], olderCount: 0 };
  await requireBoardIssue(session, input.issueId);
  const viewer = await getBoardViewerContext(session.orgId, input.guestKey);
  return getCommentPage(input.issueId, session.id, viewer, input.before);
}

/**
 * 보드 코멘트 작성.
 * 로그인한 조직 멤버면 프로필 스냅샷으로, 아니면 guestKey 기반 익명 테스터로 저장한다.
 * 익명 여부는 서버가 판별한다 — 클라이언트 주장(guestKey 유무)은 신뢰하지 않는다.
 */
export async function addBoardComment(input: {
  token: string;
  issueId: number;
  body: string;
  guestKey: string;
}): Promise<IssueComment> {
  const body = sanitizeBody(input.body);

  const session = await getBoardSession(input.token);
  if (!session) throw new Error("활성 QA 세션이 아닙니다");
  if (!session.active) throw new Error("만료된 QA 세션입니다");
  await requireBoardIssue(session, input.issueId);

  const member = await getOrgMemberProfile(session.orgId);

  if (!member) {
    const guestKey = input.guestKey.trim().slice(0, 64);
    if (!guestKey) throw new Error("코멘트를 작성할 수 없습니다");
    const recent = await prisma.issueComment.count({
      where: {
        guestKey,
        issue: { sessionId: session.id },
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    });
    if (recent >= RATE_LIMIT_PER_MINUTE) {
      throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
    }
    const row = await prisma.issueComment.create({
      data: { issueId: input.issueId, guestKey, body },
      include: COMMENT_INCLUDE,
    });
    return mapComment(row, await getTesterLabels([session.id]), {
      userId: null,
      isOrgMember: false,
      guestKey,
    });
  }

  const row = await prisma.issueComment.create({
    data: {
      issueId: input.issueId,
      authorUserId: member.userId,
      authorName: member.name,
      authorAvatarUrl: member.avatarUrl,
      body,
    },
    include: COMMENT_INCLUDE,
  });
  return mapComment(row, new Map(), { userId: member.userId, isOrgMember: true, guestKey: null });
}

/** 보드 코멘트 수정 — 본인만 가능하다 */
export async function updateBoardComment(input: {
  token: string;
  commentId: number;
  body: string;
  guestKey?: string | null;
}): Promise<IssueComment> {
  const body = sanitizeBody(input.body);
  const session = await getBoardSession(input.token);
  if (!session) throw new Error("활성 QA 세션이 아닙니다");
  if (!session.active) throw new Error("만료된 QA 세션입니다");

  const row = await requireBoardComment(session, input.commentId);
  const viewer = await getBoardViewerContext(session.orgId, input.guestKey);
  if (!mapComment(row, new Map(), viewer).mine) {
    throw new Error("본인 코멘트만 수정할 수 있습니다");
  }

  const updated = await prisma.issueComment.update({
    where: { id: row.id },
    data: { body },
    include: COMMENT_INCLUDE,
  });
  return mapComment(updated, await getTesterLabels([session.id]), viewer);
}

/** 보드 코멘트 삭제 — 본인 또는 조직 멤버(관리자)만 가능하다 */
export async function deleteBoardComment(input: {
  token: string;
  commentId: number;
  guestKey?: string | null;
}): Promise<void> {
  const session = await getBoardSession(input.token);
  if (!session) throw new Error("활성 QA 세션이 아닙니다");
  if (!session.active) throw new Error("만료된 QA 세션입니다");

  const row = await requireBoardComment(session, input.commentId);
  const viewer = await getBoardViewerContext(session.orgId, input.guestKey);
  if (!mapComment(row, new Map(), viewer).deletable) {
    throw new Error("삭제 권한이 없습니다");
  }
  await prisma.issueComment.delete({ where: { id: row.id } });
}

/** 보드 접속자가 조직 멤버면 프로필을 돌려준다 — 입력창 아바타 표시에 쓴다 */
export async function getBoardViewer(token: string): Promise<IssueCommentViewer | null> {
  const session = await getBoardSession(token);
  if (!session) return null;
  const member = await getOrgMemberProfile(session.orgId);
  return member ? { name: member.name, avatar_url: member.avatarUrl } : null;
}

// ── 관리자 대시보드 (조직 멤버십 인가) ──────────────────────────────────────
// 호출부(액션)가 requireOrgBySlug로 멤버십을 확인하고 orgId를 넘긴다.
// 여기서는 이슈/코멘트가 그 조직 소유인지를 다시 검증한다.

async function requireOrgIssue(
  orgId: string,
  issueId: number,
): Promise<{ sessionId: string | null }> {
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, project: { orgId } },
    select: { sessionId: true },
  });
  if (!issue) throw new Error("이슈를 찾을 수 없습니다");
  return issue;
}

async function requireOrgComment(orgId: string, commentId: number): Promise<CommentRow> {
  const row = await prisma.issueComment.findFirst({
    where: { id: commentId, issue: { project: { orgId } } },
    include: COMMENT_INCLUDE,
  });
  if (!row) throw new Error("코멘트를 찾을 수 없습니다");
  return row;
}

async function getOrgViewerContext(orgId: string): Promise<CommentViewerContext> {
  const member = await getOrgMemberProfile(orgId);
  return { userId: member?.userId ?? null, isOrgMember: member !== null, guestKey: null };
}

/** 관리자 이슈 목록 접힌 상태용 — 여러 세션의 이슈가 섞여 있어 세션별로 라벨을 매긴다 */
export async function getOrgCommentSummaries(
  orgId: string,
  issueIds: number[],
): Promise<Record<number, IssueCommentSummary>> {
  if (issueIds.length === 0) return {};
  const [owned, viewer] = await Promise.all([
    prisma.issue.findMany({
      where: { id: { in: issueIds }, project: { orgId } },
      select: { id: true, sessionId: true },
    }),
    getOrgViewerContext(orgId),
  ]);
  return getCommentSummaries(
    owned.map((issue) => issue.id),
    owned.map((issue) => issue.sessionId),
    viewer,
  );
}

export async function listOrgIssueComments(
  orgId: string,
  issueId: number,
  before?: number | null,
): Promise<IssueCommentPage> {
  const issue = await requireOrgIssue(orgId, issueId);
  const viewer = await getOrgViewerContext(orgId);
  return getCommentPage(issueId, issue.sessionId, viewer, before);
}

/** 관리자 코멘트 작성 — 항상 멤버 프로필 스냅샷으로 저장한다 */
export async function addOrgComment(input: {
  orgId: string;
  issueId: number;
  body: string;
}): Promise<IssueComment> {
  const body = sanitizeBody(input.body);
  await requireOrgIssue(input.orgId, input.issueId);

  const member = await getOrgMemberProfile(input.orgId);
  if (!member) throw new Error("조직 멤버만 코멘트를 작성할 수 있습니다");

  const row = await prisma.issueComment.create({
    data: {
      issueId: input.issueId,
      authorUserId: member.userId,
      authorName: member.name,
      authorAvatarUrl: member.avatarUrl,
      body,
    },
    include: COMMENT_INCLUDE,
  });
  return mapComment(row, new Map(), { userId: member.userId, isOrgMember: true, guestKey: null });
}

/** 관리자 코멘트 수정 — 본인 것만 가능하다 */
export async function updateOrgComment(input: {
  orgId: string;
  commentId: number;
  body: string;
}): Promise<IssueComment> {
  const body = sanitizeBody(input.body);
  const row = await requireOrgComment(input.orgId, input.commentId);
  const viewer = await getOrgViewerContext(input.orgId);
  if (!mapComment(row, new Map(), viewer).mine) {
    throw new Error("본인 코멘트만 수정할 수 있습니다");
  }
  const updated = await prisma.issueComment.update({
    where: { id: row.id },
    data: { body },
    include: COMMENT_INCLUDE,
  });
  return mapComment(updated, await getTesterLabels([updated.issue.sessionId]), viewer);
}

/** 관리자 코멘트 삭제 — 조직 멤버는 누구의 코멘트든 지울 수 있다 */
export async function deleteOrgComment(input: { orgId: string; commentId: number }): Promise<void> {
  const row = await requireOrgComment(input.orgId, input.commentId);
  const viewer = await getOrgViewerContext(input.orgId);
  if (!viewer.isOrgMember) throw new Error("삭제 권한이 없습니다");
  await prisma.issueComment.delete({ where: { id: row.id } });
}

/** 관리자 화면 입력창 아바타용 접속자 프로필 */
export async function getOrgViewer(orgId: string): Promise<IssueCommentViewer | null> {
  const member = await getOrgMemberProfile(orgId);
  return member ? { name: member.name, avatar_url: member.avatarUrl } : null;
}
