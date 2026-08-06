"use client";

import { useState, type ReactNode } from "react";
import { HiChevronDown, HiChevronUp, HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { Button, IconButton } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { LocalTime } from "@/components/ui/local-time";
import { RelativeTime } from "@/components/ui/relative-time";
import { AssigneeControl, IssueStatusSelect } from "@/features/issues/components/issue-controls";
import { CommentAvatar } from "@/features/issues/components/issue-comments";
import { IssueCopyButton } from "@/features/issues/components/issue-copy-button";
import { IssueCancelButton } from "@/features/issues/components/issue-cancel-button";
import { IssueCustomerConfirmButton } from "@/features/issues/components/issue-customer-confirm-button";
import { IssueMemoEditor } from "@/features/issues/components/issue-memo-editor";
import { IssueMeta } from "@/features/issues/components/issue-meta";
import { IssueScreenshotPreview } from "@/features/issues/components/issue-screenshot-preview";
import {
  ISSUE_STATUS_LABEL,
  IssueStatusBadge,
} from "@/features/issues/components/issue-status";
import type { Issue, IssueCommentSummary, OrgMemberProfile } from "@/lib/types";

export function IssueCard({
  issue,
  orgSlug,
  members,
  readOnly = false,
  screenshotMaxHeight = "md",
  customerConfirmToken,
  showMeta = true,
  footer,
  commentSummary,
}: {
  issue: Issue;
  orgSlug?: string;
  members?: OrgMemberProfile[] | null;
  readOnly?: boolean;
  screenshotMaxHeight?: "sm" | "md";
  customerConfirmToken?: string;
  showMeta?: boolean;
  /** 카드 하단 전체 폭 영역 (보드의 코멘트 등) */
  footer?: ReactNode;
  /** 접힌 행의 마지막 댓글 미리보기용. 접기 중 갱신까지 정확할 필요는 없다 */
  commentSummary?: IssueCommentSummary;
}) {
  const [status, setStatus] = useState(issue.status);
  const [assignee, setAssignee] = useState(issue.assignee);
  const [editing, setEditing] = useState(false);
  // 처리가 끝난 이슈는 목록에서 자리를 덜 차지하도록 요약 한 줄로 시작한다
  const [collapsed, setCollapsed] = useState(
    issue.status === "DONE" || issue.status === "CLOSED",
  );
  const collapsible = status === "DONE" || status === "CLOSED";
  const compactReadOnly = readOnly && !showMeta;
  // 처리가 끝난 이슈는 기록으로 고정한다. 서버 유스케이스에서도 같은 조건으로 막는다
  const customerEditable = status === "OPEN" || status === "IN_PROGRESS";
  // 종료된 건은 할 수 있는 동작이 없으므로 비활성 버튼을 남기지 않고 아예 감춘다
  const customerActions = Boolean(customerConfirmToken) && status !== "CLOSED";
  // 스크린샷 / 고객 액션 / 관리자 컨트롤 중 하나라도 있으면 오른쪽 고정폭 컬럼을 만든다
  const hasSideColumn = Boolean(
    issue.screenshot_url || (compactReadOnly ? customerActions : !readOnly),
  );

  if (collapsed) {
    const latest = commentSummary?.latest ?? null;
    return (
      <li>
        <button
          type="button"
          aria-expanded={false}
          onClick={() => setCollapsed(false)}
          className={cn(
            cardClasses("sm"),
            "flex w-full min-w-0 items-center gap-2 text-left text-sm transition-colors hover:bg-surface-hover",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          )}
        >
          <span className="shrink-0 font-bold">#{issue.number}</span>
          <IssueStatusBadge status={status} label={ISSUE_STATUS_LABEL[status]} />
          <span className="min-w-0 flex-1 truncate text-muted">{issue.memo}</span>
          {latest && (
            <span className="flex shrink-0 items-center gap-1.5 text-muted">
              <HiOutlineChatBubbleOvalLeft aria-hidden className="size-4" />
              <span className="font-semibold">{commentSummary?.count}</span>
              <span className="hidden items-center gap-1.5 sm:flex">
                <CommentAvatar author={latest.author} size="sm" />
                <span className="max-w-48 truncate">{latest.body}</span>
                <RelativeTime value={latest.created_at} className="text-xs text-subtle" />
              </span>
            </span>
          )}
          <HiChevronDown aria-hidden className="size-4 shrink-0 text-subtle" />
        </button>
      </li>
    );
  }

  if (compactReadOnly) {
    return (
      <li className={cardClasses()}>
        <div
          className={cn(
            "grid gap-4",
            hasSideColumn && "md:grid-cols-[minmax(0,1fr)_18rem] md:items-stretch md:gap-x-6",
          )}
        >
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-bold">#{issue.number}</span>
              <IssueStatusBadge status={status} label={ISSUE_STATUS_LABEL[status]} />
              {collapsible && (
                <IconButton
                  size="sm"
                  label="접기"
                  icon={<HiChevronUp aria-hidden className="size-4" />}
                  onClick={() => setCollapsed(true)}
                />
              )}
              {!hasSideColumn && <LocalTime value={issue.created_at} className="text-xs text-subtle" />}
            </div>
            {customerConfirmToken ? (
              <IssueMemoEditor
                issueId={issue.id}
                token={customerConfirmToken}
                memo={issue.memo}
                editing={editing}
                onClose={() => setEditing(false)}
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm">{issue.memo}</p>
            )}
          </div>
          {hasSideColumn && (
            <div className="flex flex-col gap-3 md:w-72">
              {customerActions && customerConfirmToken && (
                <div className="flex w-full items-center gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={!customerEditable || editing}
                    onClick={() => setEditing(true)}
                  >
                    수정
                  </Button>
                  {status === "DONE" ? (
                    <IssueCustomerConfirmButton
                      issueId={issue.id}
                      token={customerConfirmToken}
                      onConfirmed={() => setStatus("CLOSED")}
                      className="flex-1"
                    />
                  ) : (
                    <IssueCancelButton
                      issueId={issue.id}
                      token={customerConfirmToken}
                      onCanceled={() => setStatus("CLOSED")}
                      className="flex-1"
                    />
                  )}
                </div>
              )}
              {issue.screenshot_url && (
                <IssueScreenshotPreview
                  issueId={issue.id}
                  screenshotUrl={issue.screenshot_url}
                  maxHeight={screenshotMaxHeight}
                  fill
                />
              )}
              <LocalTime value={issue.created_at} className="text-right text-xs text-subtle" />
            </div>
          )}
        </div>
        {footer && <div className="mt-4">{footer}</div>}
      </li>
    );
  }

  return (
    <li className={cardClasses()}>
      <div
        className={cn(
          "grid gap-4",
          hasSideColumn && "md:grid-cols-[minmax(0,1fr)_18rem] md:items-stretch md:gap-x-6",
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold">#{issue.number}</span>
            {readOnly && <IssueStatusBadge status={status} label={ISSUE_STATUS_LABEL[status]} />}
            {collapsible && (
              <IconButton
                size="sm"
                label="접기"
                icon={<HiChevronUp aria-hidden className="size-4" />}
                onClick={() => setCollapsed(true)}
              />
            )}
            {!hasSideColumn && <LocalTime value={issue.created_at} className="truncate text-xs text-subtle" />}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm">{issue.memo}</p>
          {showMeta && <IssueMeta issue={issue} />}
        </div>
        {hasSideColumn && (
          <div className="flex min-w-0 flex-col gap-3 md:w-72">
            {!readOnly && (
              <div className="flex w-full items-center gap-2">
                <div className="w-28 shrink-0">
                  <IssueStatusSelect
                    issueId={issue.id}
                    orgSlug={orgSlug ?? ""}
                    status={status}
                    onStatusChange={setStatus}
                    className="w-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <AssigneeControl
                    issueId={issue.id}
                    orgSlug={orgSlug ?? ""}
                    assignee={assignee}
                    members={members ?? null}
                    onAssigneeChange={setAssignee}
                    className="w-full"
                  />
                </div>
                <IssueCopyButton issue={issue} status={status} assignee={assignee} />
              </div>
            )}
            {issue.screenshot_url && (
              <IssueScreenshotPreview
                issueId={issue.id}
                screenshotUrl={issue.screenshot_url}
                maxHeight={screenshotMaxHeight}
                fill
              />
            )}
            <LocalTime value={issue.created_at} className="text-right text-xs text-subtle" />
          </div>
        )}
      </div>
      {footer && <div className="mt-4">{footer}</div>}
    </li>
  );
}
