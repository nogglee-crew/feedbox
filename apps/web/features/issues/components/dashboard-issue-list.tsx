"use client";

import { useCallback, useEffect, useState } from "react";
import { loadMoreDashboardIssues } from "@/app/issue-actions";
import { cardClasses } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IssueCard } from "@/features/issues/components/issue-card";
import { IssueComments } from "@/features/issues/components/issue-comments";
import { useInfiniteScroll } from "@/features/issues/components/use-infinite-scroll";
import type {
  Issue,
  IssueCommentSummary,
  IssueCommentViewer,
  OrgMember,
} from "@/lib/types";

const EMPTY_SUMMARY: IssueCommentSummary = { count: 0, latest: null };

export function DashboardIssueList({
  orgSlug,
  releaseId,
  status,
  q,
  members,
  initialItems,
  initialCursor,
  initialComments,
  viewer,
}: {
  orgSlug: string;
  releaseId: string;
  status: string;
  q: string;
  members: OrgMember[];
  initialItems: Issue[];
  initialCursor: number | null;
  initialComments: Record<number, IssueCommentSummary>;
  viewer: IssueCommentViewer | null;
}) {
  const resetKey = `${status}|${q}`;
  const [comments, setComments] = useState(initialComments);

  // 필터 변경으로 서버가 새 첫 페이지를 내려주면 요약도 갈아끼운다 (useInfiniteScroll과 같은 방식)
  useEffect(() => {
    setComments(initialComments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const fetchPage = useCallback(
    async (cursor: number | null) => {
      const page = await loadMoreDashboardIssues({ orgSlug, releaseId, cursor, status, q });
      setComments((prev) => ({ ...prev, ...page.comments }));
      return page;
    },
    [orgSlug, releaseId, status, q],
  );

  const { items, sentinelRef, loading, hasMore } = useInfiniteScroll<Issue>({
    initialItems,
    initialCursor,
    resetKey,
    fetchPage,
  });

  if (items.length === 0) {
    return (
      <ul className="space-y-3">
        <li className={cardClasses("none")}>
          <EmptyState>아직 등록된 이슈가 없습니다.</EmptyState>
        </li>
      </ul>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {items.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            members={members}
            orgSlug={orgSlug}
            commentSummary={comments[issue.id] ?? EMPTY_SUMMARY}
            footer={
              <IssueComments
                scope={{ kind: "dashboard", orgSlug }}
                issueId={issue.id}
                initialSummary={comments[issue.id] ?? EMPTY_SUMMARY}
                viewer={viewer}
              />
            }
          />
        ))}
      </ul>
      {hasMore && (
        <div ref={sentinelRef} className="py-4 text-center text-xs text-subtle">
          {loading ? "불러오는 중..." : ""}
        </div>
      )}
    </>
  );
}
