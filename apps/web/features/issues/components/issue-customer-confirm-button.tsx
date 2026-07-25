"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmIssueResolved } from "@/app/board-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function IssueCustomerConfirmButton({
  issueId,
  token,
  onConfirmed,
  className,
}: {
  issueId: number;
  token: string;
  onConfirmed: () => void;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <Button
      size="sm"
      variant="secondary"
      className={className}
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void confirmIssueResolved(token, issueId)
            .then(() => {
              onConfirmed();
              router.refresh();
              showToast({ message: "확인 완료했습니다", tone: "success" });
            })
            .catch(() => showToast({ message: "확인 완료 처리에 실패했습니다", tone: "danger" }));
        });
      }}
    >
      {pending ? "처리 중..." : "확인 완료"}
    </Button>
  );
}
