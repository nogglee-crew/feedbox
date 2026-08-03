"use client";

import { loadMoreDashboardIssues } from "@/app/issue-actions";
import { cardClasses } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IssueCard } from "@/features/issues/components/issue-card";
import { useInfiniteScroll } from "@/features/issues/components/use-infinite-scroll";
import type { Issue, OrgMember } from "@/lib/types";

export function DashboardIssueList({
  orgSlug,
  releaseId,
  status,
  q,
  members,
  initialItems,
  initialCursor,
}: {
  orgSlug: string;
  releaseId: string;
  status: string;
  q: string;
  members: OrgMember[];
  initialItems: Issue[];
  initialCursor: number | null;
}) {
  const { items, sentinelRef, loading, hasMore } = useInfiniteScroll<Issue>({
    initialItems,
    initialCursor,
    resetKey: `${status}|${q}`,
    fetchPage: (cursor) =>
      loadMoreDashboardIssues({ orgSlug, releaseId, cursor, status, q }),
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
          <IssueCard key={issue.id} issue={issue} members={members} orgSlug={orgSlug} />
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
