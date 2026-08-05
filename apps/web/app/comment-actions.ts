"use server";

import {
  addBoardComment,
  addOrgComment,
  deleteBoardComment,
  deleteOrgComment,
  listBoardIssueComments,
  listOrgIssueComments,
  updateBoardComment,
  updateOrgComment,
  type IssueCommentPage,
} from "@/features/issues/server/comments";
import { requireOrgBySlug } from "@/lib/orgs";
import type { IssueComment } from "@/lib/types";

type SubmitResult = { comment: IssueComment } | { error: string };
type DeleteResult = { ok: true } | { error: string };

/** 공개 보드 코멘트 조회 — 세션 토큰으로 인가하고 그 세션의 이슈만 허용한다 */
export async function loadIssueComments(input: {
  token: string;
  issueId: number;
  before?: number | null;
  guestKey?: string | null;
}): Promise<IssueCommentPage> {
  return listBoardIssueComments(input);
}

/** 공개 보드 코멘트 작성 — 멤버/익명 판별은 서버가 한다 */
export async function submitIssueComment(input: {
  token: string;
  issueId: number;
  body: string;
  guestKey: string;
}): Promise<SubmitResult> {
  try {
    return { comment: await addBoardComment(input) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "코멘트 등록에 실패했습니다" };
  }
}

/** 공개 보드 코멘트 수정 — 본인만 */
export async function editIssueComment(input: {
  token: string;
  commentId: number;
  body: string;
  guestKey?: string | null;
}): Promise<SubmitResult> {
  try {
    return { comment: await updateBoardComment(input) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "코멘트 수정에 실패했습니다" };
  }
}

/** 공개 보드 코멘트 삭제 — 본인 또는 조직 멤버 */
export async function removeIssueComment(input: {
  token: string;
  commentId: number;
  guestKey?: string | null;
}): Promise<DeleteResult> {
  try {
    await deleteBoardComment(input);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "코멘트 삭제에 실패했습니다" };
  }
}

/** 관리자 이슈 목록 코멘트 조회 — 조직 멤버십으로 인가한다 */
export async function loadDashboardIssueComments(input: {
  orgSlug: string;
  issueId: number;
  before?: number | null;
}): Promise<IssueCommentPage> {
  const ctx = await requireOrgBySlug(input.orgSlug);
  return listOrgIssueComments(ctx.org.id, input.issueId, input.before);
}

/** 관리자 코멘트 작성 */
export async function submitDashboardIssueComment(input: {
  orgSlug: string;
  issueId: number;
  body: string;
}): Promise<SubmitResult> {
  try {
    const ctx = await requireOrgBySlug(input.orgSlug);
    return {
      comment: await addOrgComment({ orgId: ctx.org.id, issueId: input.issueId, body: input.body }),
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "코멘트 등록에 실패했습니다" };
  }
}

/** 관리자 코멘트 수정 — 본인 것만 */
export async function editDashboardIssueComment(input: {
  orgSlug: string;
  commentId: number;
  body: string;
}): Promise<SubmitResult> {
  try {
    const ctx = await requireOrgBySlug(input.orgSlug);
    return {
      comment: await updateOrgComment({
        orgId: ctx.org.id,
        commentId: input.commentId,
        body: input.body,
      }),
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "코멘트 수정에 실패했습니다" };
  }
}

/** 관리자 코멘트 삭제 — 조직 멤버는 누구의 코멘트든 삭제 가능 */
export async function removeDashboardIssueComment(input: {
  orgSlug: string;
  commentId: number;
}): Promise<DeleteResult> {
  try {
    const ctx = await requireOrgBySlug(input.orgSlug);
    await deleteOrgComment({ orgId: ctx.org.id, commentId: input.commentId });
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "코멘트 삭제에 실패했습니다" };
  }
}
