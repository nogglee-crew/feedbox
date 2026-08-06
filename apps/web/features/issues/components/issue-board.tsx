"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadMoreBoardIssues } from "@/app/issue-actions";
import { Dot } from "@/components/ui/badge";
import { cardClasses } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { IssueCard } from "@/features/issues/components/issue-card";
import { IssueComments } from "@/features/issues/components/issue-comments";
import { ISSUE_STATUS_LABEL, ISSUE_STATUS_TONE } from "@/features/issues/components/issue-status";
import {
  ISSUE_STATUSES,
  type Issue,
  type IssueCommentSummary,
  type IssueCommentViewer,
  type IssueStatus,
} from "@/lib/types";

const EMPTY_SUMMARY: IssueCommentSummary = { count: 0, latest: null };

export function IssueBoard({
  token,
  counts,
  initialItems,
  initialCursor,
  initialComments,
  viewer,
}: {
  token: string;
  counts: Record<IssueStatus, number>;
  initialItems: Issue[];
  initialCursor: number | null;
  initialComments: Record<number, IssueCommentSummary>;
  viewer: IssueCommentViewer | null;
}) {
  const [status, setStatus] = useState<IssueStatus | null>(null);
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [comments, setComments] = useState(initialComments);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 상태 탭 전환: 서버에서 그 상태의 첫 페이지를 새로 받아 목록을 갈아끼운다
  const selectStatus = useCallback(
    async (next: IssueStatus | null) => {
      setStatus(next);
      setLoading(true);
      setItems([]);
      setCursor(null);
      try {
        const page = await loadMoreBoardIssues({ token, cursor: null, status: next ?? undefined });
        setItems(page.items);
        setCursor(page.nextCursor);
        setComments(page.comments);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const loadMore = useCallback(async () => {
    if (loading || cursor === null) return;
    setLoading(true);
    try {
      const page = await loadMoreBoardIssues({ token, cursor, status: status ?? undefined });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setComments((prev) => ({ ...prev, ...page.comments }));
    } finally {
      setLoading(false);
    }
  }, [loading, cursor, status, token]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || cursor === null) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, cursor]);

  return (
    <>
      <div role="radiogroup" aria-label="상태 필터" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ISSUE_STATUSES.map((s) => {
          const selected = status === s;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cn(
                cardClasses("sm"),
                "text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                selected ? "border-border-selected" : "hover:bg-surface-hover",
              )}
              onClick={() => void selectStatus(selected ? null : s)}
            >
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold",
                  selected ? "text-foreground" : "text-muted",
                )}
              >
                <Dot tone={ISSUE_STATUS_TONE[s]} />
                {ISSUE_STATUS_LABEL[s]}
              </div>
              <div className="mt-1 text-2xl font-bold">{counts[s]}</div>
            </button>
          );
        })}
      </div>

      <ul className="space-y-3">
        {items.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            readOnly
            screenshotMaxHeight="sm"
            customerConfirmToken={token}
            showMeta={false}
            commentSummary={comments[issue.id] ?? EMPTY_SUMMARY}
            footer={
              <IssueComments
                scope={{ kind: "board", token }}
                issueId={issue.id}
                initialSummary={comments[issue.id] ?? EMPTY_SUMMARY}
                viewer={viewer}
              />
            }
          />
        ))}
        {items.length === 0 && !loading && (
          <li className={cardClasses("none")}>
            <EmptyState>
              {status
                ? `${ISSUE_STATUS_LABEL[status]} 상태의 이슈가 없습니다.`
                : "아직 등록된 이슈가 없습니다."}
            </EmptyState>
          </li>
        )}
      </ul>
      {(cursor !== null || loading) && (
        <div ref={sentinelRef} className="py-4 text-center text-xs text-subtle">
          {loading ? "불러오는 중..." : ""}
        </div>
      )}
    </>
  );
}
