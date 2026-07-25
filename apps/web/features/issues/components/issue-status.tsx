import { StatusBadge, type Tone } from "@/components/ui/badge";
import type { IssueStatus } from "@/lib/types";

/** 미처리(OPEN)만 주의를 끌고 나머지는 가라앉힌다 */
export const ISSUE_STATUS_TONE: Record<IssueStatus, Tone> = {
  OPEN: "danger",
  IN_PROGRESS: "warning",
  DONE: "success",
  CLOSED: "neutral",
};

export function IssueStatusBadge({ status, label }: { status: IssueStatus; label: string }) {
  return (
    <StatusBadge tone={ISSUE_STATUS_TONE[status]} emphasis={status === "OPEN"}>
      {label}
    </StatusBadge>
  );
}
