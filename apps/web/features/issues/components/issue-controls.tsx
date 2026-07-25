"use client";

import { useState, useTransition } from "react";
import { updateIssueAssignee, updateIssueStatus } from "@/app/actions";
import { ISSUE_STATUS_TONE } from "@/features/issues/components/issue-status";
import { Dot } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { ISSUE_STATUSES, type IssueStatus } from "@/lib/types";

const STATUS_LABEL: Record<IssueStatus, string> = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN PROGRESS",
  DONE: "DONE",
  CLOSED: "CLOSED",
};

export function IssueStatusSelect({ issueId, status }: { issueId: number; status: IssueStatus }) {
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();
  return (
    <Select
      size="sm"
      aria-label="이슈 상태"
      value={status}
      disabled={pending}
      adornment={<Dot tone={ISSUE_STATUS_TONE[status]} />}
      className="font-semibold"
      onChange={(e) => {
        const nextStatus = e.target.value;
        startTransition(() => {
          void updateIssueStatus(issueId, nextStatus)
            .then(() => showToast({ message: "이슈 상태를 저장했습니다", tone: "success" }))
            .catch(() => showToast({ message: "이슈 상태 저장에 실패했습니다", tone: "danger" }));
        });
      }}
    >
      {ISSUE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </Select>
  );
}

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
  const { showToast } = useToast();

  if (members) {
    // Preserve legacy assignees that are no longer organization members.
    const options = assignee && !members.includes(assignee) ? [assignee, ...members] : members;
    return (
      <Select
        size="sm"
        aria-label="담당자"
        value={assignee ?? ""}
        disabled={pending}
        className="max-w-44"
        onChange={(e) => {
          const nextAssignee = e.target.value;
          startTransition(() => {
            void updateIssueAssignee(issueId, nextAssignee)
              .then(() => showToast({ message: "담당자를 저장했습니다", tone: "success" }))
              .catch(() => showToast({ message: "담당자 저장에 실패했습니다", tone: "danger" }));
          });
        }}
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
          startTransition(() => {
            void updateIssueAssignee(issueId, value)
              .then(() => showToast({ message: "담당자를 저장했습니다", tone: "success" }))
              .catch(() => showToast({ message: "담당자 저장에 실패했습니다", tone: "danger" }));
          });
        }
      }}
    />
  );
}
