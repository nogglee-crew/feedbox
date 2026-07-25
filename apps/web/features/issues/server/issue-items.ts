import type { Issue } from "@/lib/types";

/**
 * 날짜 라벨은 서버에서 한 번만 포맷해 문자열로 넘긴다.
 * (클라이언트에서 다시 포맷하면 로케일 차이로 hydration 불일치가 날 수 있다)
 */
export interface DashboardIssueItem {
  issue: Issue;
  createdAtLabel: string;
}

export interface BoardIssueItem {
  issue: Issue;
  createdAtLabel: string;
  createdDateLabel: string;
  createdTimeLabel: string;
}

export function toDashboardItem(issue: Issue): DashboardIssueItem {
  return { issue, createdAtLabel: new Date(issue.created_at).toLocaleString("ko-KR") };
}

export function toBoardItem(issue: Issue): BoardIssueItem {
  const createdAt = new Date(issue.created_at);
  return {
    issue,
    createdAtLabel: createdAt.toLocaleString("ko-KR"),
    createdDateLabel: createdAt.toLocaleDateString("ko-KR"),
    createdTimeLabel: createdAt.toLocaleTimeString("ko-KR"),
  };
}
