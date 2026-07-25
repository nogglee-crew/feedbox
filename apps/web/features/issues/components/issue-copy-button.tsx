"use client";

import { useState } from "react";
import { HiCheck, HiClipboardDocument } from "react-icons/hi2";
import { IconButton } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatBrowser } from "@/features/issues/components/issue-meta";
import type { Issue, IssueStatus } from "@/lib/types";

function issueClipboardJson({
  issue,
  status,
  assignee,
}: {
  issue: Issue;
  status: IssueStatus;
  assignee: string | null;
}): string {
  return JSON.stringify(
    {
      schema: "feedbox.issue.v1",
      id: issue.id,
      project_id: issue.project_id,
      release_id: issue.release_id,
      session_id: issue.session_id,
      status,
      assignee_email: assignee,
      memo: issue.memo,
      page_url: issue.page_url,
      selector: issue.selector,
      element_text: issue.element_text,
      environment: {
        viewport_width: issue.viewport_width,
        viewport_height: issue.viewport_height,
        browser: formatBrowser(issue.browser),
        user_agent: issue.browser,
      },
      error: {
        name: issue.error_name,
        code: issue.error_code,
        message: issue.error_message,
        stack: issue.error_stack,
      },
      api: {
        method: issue.api_method,
        url: issue.api_url,
        status: issue.api_status,
      },
      screenshot_url: issue.screenshot_url,
      created_at: issue.created_at,
    },
    null,
    2,
  );
}

export function IssueCopyButton({
  issue,
  status,
  assignee,
}: {
  issue: Issue;
  status: IssueStatus;
  assignee: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  return (
    <IconButton
      size="sm"
      label="이슈 JSON 복사"
      aria-label="이슈 JSON 복사"
      icon={
        copied ? (
          <HiCheck aria-hidden className="size-4 text-success" />
        ) : (
          <HiClipboardDocument aria-hidden className="size-4" />
        )
      }
      className="h-8 w-8 shrink-0 border border-border-strong"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(issueClipboardJson({ issue, status, assignee }));
          setCopied(true);
          showToast({ message: "이슈 정보를 복사했습니다", tone: "success" });
          setTimeout(() => setCopied(false), 1500);
        } catch {
          showToast({ message: "이슈 정보 복사에 실패했습니다", tone: "danger" });
        }
      }}
    />
  );
}
