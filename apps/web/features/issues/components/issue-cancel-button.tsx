"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cancelIssue } from "@/app/board-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function IssueCancelButton({
  issueId,
  token,
  onCanceled,
  className,
}: {
  issueId: number;
  token: string;
  onCanceled: () => void;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <Button
      size="sm"
      variant="danger"
      className={className}
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void cancelIssue(token, issueId)
            .then(() => {
              onCanceled();
              router.refresh();
              showToast({ message: "이슈를 취소했습니다", tone: "success" });
            })
            .catch(() => showToast({ message: "취소에 실패했습니다", tone: "danger" }));
        });
      }}
    >
      {pending ? "처리 중..." : "이슈 취소"}
    </Button>
  );
}
