"use client";

import { useState } from "react";
import { Dot } from "@/components/ui/badge";
import { cardClasses } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { IssueCard } from "@/features/issues/components/issue-card";
import { ISSUE_STATUS_LABEL, ISSUE_STATUS_TONE } from "@/features/issues/components/issue-status";
import { ISSUE_STATUSES, type Issue, type IssueStatus } from "@/lib/types";

export interface BoardIssue {
  issue: Issue;
  createdAtLabel: string;
  createdDateLabel: string;
  createdTimeLabel: string;
}

export function IssueBoard({ issues, token }: { issues: BoardIssue[]; token: string }) {
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | null>(null);
  const counts = Object.fromEntries(
    ISSUE_STATUSES.map((status) => [
      status,
      issues.filter(({ issue }) => issue.status === status).length,
    ]),
  ) as Record<IssueStatus, number>;
  const visibleIssues = selectedStatus
    ? issues.filter(({ issue }) => issue.status === selectedStatus)
    : issues;

  return (
    <>
      <div role="radiogroup" aria-label="상태 필터" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ISSUE_STATUSES.map((status) => {
          const selected = selectedStatus === status;
          return (
            <button
              key={status}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cn(
                cardClasses("sm"),
                "text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                // 배경은 그대로 두고 테두리만 진하게 해서 선택을 표시한다
                selected ? "border-border-selected" : "hover:bg-surface-hover",
              )}
              onClick={() => setSelectedStatus(selected ? null : status)}
            >
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold",
                  selected ? "text-foreground" : "text-muted",
                )}
              >
                <Dot tone={ISSUE_STATUS_TONE[status]} />
                {ISSUE_STATUS_LABEL[status]}
              </div>
              <div className="mt-1 text-2xl font-bold">{counts[status]}</div>
            </button>
          );
        })}
      </div>

      <ul className="space-y-3">
        {visibleIssues.map(({ issue, createdAtLabel, createdDateLabel, createdTimeLabel }) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            readOnly
            screenshotMaxHeight="sm"
            createdAtLabel={createdAtLabel}
            createdDateLabel={createdDateLabel}
            createdTimeLabel={createdTimeLabel}
            customerConfirmToken={token}
            showMeta={false}
          />
        ))}
        {visibleIssues.length === 0 && (
          <li className={cardClasses("none")}>
            <EmptyState>
              {selectedStatus
                ? `${ISSUE_STATUS_LABEL[selectedStatus]} 상태의 이슈가 없습니다.`
                : "아직 등록된 이슈가 없습니다."}
            </EmptyState>
          </li>
        )}
      </ul>
    </>
  );
}
