"use client";

import { useState, useTransition } from "react";
import { HiCheck, HiChevronDown } from "react-icons/hi2";
import { updateIssueAssignee, updateIssueStatus } from "@/app/actions";
import { Avatar } from "@/components/ui/avatar";
import { Dot } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { Input } from "@/components/ui/input";
import { Menu, menuItemClasses } from "@/components/ui/menu";
import { useToast } from "@/components/ui/toast";
import { ISSUE_STATUS_LABEL, ISSUE_STATUS_TONE } from "@/features/issues/components/issue-status";
import { ISSUE_STATUSES, type IssueStatus, type OrgMemberProfile } from "@/lib/types";

export function IssueStatusSelect({
  issueId,
  status,
  onStatusChange,
  className,
}: {
  issueId: number;
  status: IssueStatus;
  onStatusChange?: (status: IssueStatus) => void;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();
  const saveStatus = (nextStatus: IssueStatus) => {
    const previousStatus = status;
    onStatusChange?.(nextStatus);
    startTransition(() => {
      void updateIssueStatus(issueId, nextStatus)
        .then(() => showToast({ message: "이슈 상태를 저장했습니다", tone: "success" }))
        .catch(() => {
          onStatusChange?.(previousStatus);
          showToast({ message: "이슈 상태 저장에 실패했습니다", tone: "danger" });
        });
    });
  };

  return (
    <Menu
      label="이슈 상태"
      align="right"
      panelClassName="w-44"
      triggerClassName={cn(
        "h-8 rounded-md border border-border-strong bg-surface px-2 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-surface-hover disabled:bg-surface-disabled disabled:text-muted",
        className,
      )}
      trigger={
        <span className="flex h-full min-w-0 items-center gap-2">
          <Dot tone={ISSUE_STATUS_TONE[status]} />
          <span className="min-w-0 flex-1 truncate text-left">{ISSUE_STATUS_LABEL[status]}</span>
          <HiChevronDown aria-hidden className="size-3.5 shrink-0 text-subtle" />
        </span>
      }
    >
      {(close) => (
        <div className="space-y-1">
          {ISSUE_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={menuItemClasses(s === status ? "bg-surface-muted font-semibold" : undefined)}
              disabled={pending}
              onClick={() => {
                saveStatus(s);
                close();
              }}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Dot tone={ISSUE_STATUS_TONE[s]} />
                <span className="truncate">{ISSUE_STATUS_LABEL[s]}</span>
              </span>
              {s === status && <HiCheck aria-hidden className="size-4 text-muted" />}
            </button>
          ))}
        </div>
      )}
    </Menu>
  );
}

export function AssigneeControl({
  issueId,
  assignee,
  members,
  className,
  onAssigneeChange,
}: {
  issueId: number;
  assignee: string | null;
  members: OrgMemberProfile[] | null;
  className?: string;
  onAssigneeChange?: (assignee: string | null) => void;
}) {
  const [value, setValue] = useState(assignee ?? "");
  const [selectedAssignee, setSelectedAssignee] = useState(assignee ?? "");
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  if (members) {
    // Preserve legacy assignees that are no longer organization members.
    const memberByEmail = new Map(members.map((member) => [member.email, member]));
    const legacyMember =
      selectedAssignee && !memberByEmail.has(selectedAssignee)
        ? { email: selectedAssignee, name: null, avatar_url: null }
        : null;
    const options = legacyMember ? [legacyMember, ...members] : members;
    const selectedMember = selectedAssignee ? memberByEmail.get(selectedAssignee) ?? legacyMember : null;

    const saveAssignee = (nextAssignee: string) => {
      const previousAssignee = selectedAssignee;
      setSelectedAssignee(nextAssignee);
      onAssigneeChange?.(nextAssignee || null);
      startTransition(() => {
        void updateIssueAssignee(issueId, nextAssignee)
          .then(() => showToast({ message: "담당자를 저장했습니다", tone: "success" }))
          .catch(() => {
            setSelectedAssignee(previousAssignee);
            onAssigneeChange?.(previousAssignee || null);
            showToast({ message: "담당자 저장에 실패했습니다", tone: "danger" });
          });
      });
    };

    return (
      <Menu
        label="담당자"
        align="right"
        panelClassName="w-72"
        triggerClassName={cn(
          "h-8 rounded-md border border-border-strong bg-surface px-2 py-1 text-xs text-foreground transition-colors hover:bg-surface-hover disabled:bg-surface-disabled disabled:text-muted",
          className,
        )}
        trigger={
          <span className="flex h-full min-w-0 items-center gap-2">
            {selectedMember ? (
              <Avatar
                name={selectedMember.name ?? selectedMember.email}
                src={selectedMember.avatar_url}
                size="sm"
              />
            ) : (
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-subtle">
                -
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-left">
              {selectedMember?.name ?? selectedMember?.email ?? "담당자 미지정"}
            </span>
            <HiChevronDown aria-hidden className="size-3.5 shrink-0 text-subtle" />
          </span>
        }
      >
        {(close) => (
          <div className="space-y-1">
            <button
              type="button"
              className={menuItemClasses(!selectedAssignee ? "bg-surface-muted" : undefined)}
              disabled={pending}
              onClick={() => {
                saveAssignee("");
                close();
              }}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-subtle">
                  -
                </span>
                <span className="truncate">담당자 미지정</span>
              </span>
              {!selectedAssignee && <HiCheck aria-hidden className="size-4 text-muted" />}
            </button>
            {options.map((member) => (
              <button
                key={member.email}
                type="button"
                className={menuItemClasses(
                  member.email === selectedAssignee ? "bg-surface-muted" : undefined,
                )}
                disabled={pending}
                onClick={() => {
                  saveAssignee(member.email);
                  close();
                }}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar name={member.name ?? member.email} src={member.avatar_url} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{member.name ?? member.email}</span>
                    {member.name && (
                      <span className="block truncate text-xs text-subtle">{member.email}</span>
                    )}
                  </span>
                </span>
                {member.email === selectedAssignee && <HiCheck aria-hidden className="size-4 text-muted" />}
              </button>
            ))}
          </div>
        )}
      </Menu>
    );
  }

  return (
    <Input
      size="sm"
      aria-label="담당자"
      value={value}
      disabled={pending}
      placeholder="담당자"
      className={cn("h-8", className)}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if ((assignee ?? "") !== value.trim()) {
          const previousAssignee = assignee ?? "";
          const nextAssignee = value.trim();
          onAssigneeChange?.(nextAssignee || null);
          startTransition(() => {
            void updateIssueAssignee(issueId, value)
              .then(() => showToast({ message: "담당자를 저장했습니다", tone: "success" }))
              .catch(() => {
                setValue(previousAssignee);
                onAssigneeChange?.(previousAssignee || null);
                showToast({ message: "담당자 저장에 실패했습니다", tone: "danger" });
              });
          });
        }
      }}
    />
  );
}
