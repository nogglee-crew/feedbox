import { StatusBadge, type Tone } from "@/components/ui/badge";
import type { IssueStatus } from "@/lib/types";

export const ISSUE_STATUS_TONE: Record<IssueStatus, Tone> = {
  OPEN: "danger",
  IN_PROGRESS: "warning",
  DONE: "success",
  CLOSED: "neutral",
};

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  OPEN: "접수됨",
  IN_PROGRESS: "처리 중",
  DONE: "처리 완료",
  CLOSED: "종료",
};

export function IssueStatusBadge({ status, label }: { status: IssueStatus; label: string }) {
  return (
    <StatusBadge tone={ISSUE_STATUS_TONE[status]} emphasis={status === "OPEN"}>
      {label}
    </StatusBadge>
  );
}
