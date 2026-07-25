"use client";

import { useState, useTransition } from "react";
import { updateIssueAssignee, updateIssueStatus } from "@/app/actions";
import { ISSUE_STATUS_TONE } from "@/features/issues/components/issue-status";
import { Dot } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ISSUE_STATUSES, type IssueStatus } from "@/lib/types";

const STATUS_LABEL: Record<IssueStatus, string> = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN PROGRESS",
  DONE: "DONE",
  CLOSED: "CLOSED",
};

export function IssueStatusSelect({ issueId, status }: { issueId: number; status: IssueStatus }) {
  const [pending, startTransition] = useTransition();
  return (
    <Select
      size="sm"
      aria-label="이슈 상태"
      value={status}
      disabled={pending}
      adornment={<Dot tone={ISSUE_STATUS_TONE[status]} />}
      className="font-semibold"
      onChange={(e) => startTransition(() => updateIssueStatus(issueId, e.target.value))}
    >
      {ISSUE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </Select>
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
      <Select
        size="sm"
        aria-label="담당자"
        value={assignee ?? ""}
        disabled={pending}
        className="max-w-44"
        onChange={(e) => startTransition(() => updateIssueAssignee(issueId, e.target.value))}
      >
        <option value="">담당자 미지정</option>
        {options.map((email) => (
          <option key={email} value={email}>
            {email}
          </option>
        ))}
      </Select>
    );
  }

  return (
    <Input
      size="sm"
      aria-label="담당자"
      value={value}
      disabled={pending}
      placeholder="담당자"
      className="w-24"
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if ((assignee ?? "") !== value.trim()) {
          startTransition(() => updateIssueAssignee(issueId, value));
        }
      }}
    />
  );
}
