"use client";

import { useState, useTransition } from "react";
import { updateIssueAssignee, updateIssueStatus } from "@/app/actions";
import { ISSUE_STATUSES, type IssueStatus } from "@/lib/types";

const STATUS_LABEL: Record<IssueStatus, string> = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN PROGRESS",
  DONE: "DONE",
  CLOSED: "CLOSED",
};

const STATUS_COLOR: Record<IssueStatus, string> = {
  OPEN: "bg-red-50 text-red-700 border-red-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  DONE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-gray-100 text-gray-500 border-gray-200",
};

export function IssueStatusSelect({ issueId, status }: { issueId: number; status: IssueStatus }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(() => updateIssueStatus(issueId, e.target.value))
      }
      className={`rounded-md border px-2 py-1 text-xs font-semibold ${STATUS_COLOR[status]} ${pending ? "opacity-50" : ""}`}
    >
      {ISSUE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

/**
 * 담당자 지정.
 * 멤버 목록이 있으면 select를, 없으면 자유 입력을 사용한다.
 */
export function AssigneeControl({
  issueId,
  assignee,
  members,
}: {
  issueId: number;
  assignee: string | null;
  members: string[] | null;
}) {
  const [value, setValue] = useState(assignee ?? "");
  const [pending, startTransition] = useTransition();

  if (members) {
    // 과거 데이터가 멤버 목록에 없어도 선택지에 남겨 보여준다
    const options = assignee && !members.includes(assignee) ? [assignee, ...members] : members;
    return (
      <select
        value={assignee ?? ""}
        disabled={pending}
        onChange={(e) => startTransition(() => updateIssueAssignee(issueId, e.target.value))}
        className="max-w-44 rounded-md border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
      >
        <option value="">담당자 미지정</option>
        {options.map((email) => (
          <option key={email} value={email}>
            {email}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      value={value}
      disabled={pending}
      placeholder="담당자"
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if ((assignee ?? "") !== value.trim()) {
          startTransition(() => updateIssueAssignee(issueId, value));
        }
      }}
      className="w-24 rounded-md border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
    />
  );
}
