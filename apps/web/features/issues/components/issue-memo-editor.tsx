"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateIssueMemo } from "@/app/board-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

/** 편집 진입은 카드 우측 컨트롤이 담당하므로 editing을 밖에서 받는다 */
export function IssueMemoEditor({
  issueId,
  token,
  memo,
  editing,
  onClose,
}: {
  issueId: number;
  token: string;
  memo: string;
  editing: boolean;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(memo);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (editing) setDraft(memo);
  }, [editing, memo]);

  if (!editing) return <p className="whitespace-pre-wrap text-sm">{memo}</p>;

  return (
    <div className="space-y-2">
      <Textarea
        value={draft}
        autoFocus
        rows={3}
        aria-label={`이슈 #${issueId} 내용`}
        onChange={(e) => setDraft(e.target.value)}
        className="w-full"
      />
      <div className="flex justify-end gap-2">
        <Button size="sm" onClick={onClose}>
          취소
        </Button>
        <Button
          size="sm"
          variant="primary"
          disabled={pending || !draft.trim()}
          onClick={() => {
            startTransition(() => {
              void updateIssueMemo(token, issueId, draft)
                .then(() => {
                  onClose();
                  router.refresh();
                  showToast({ message: "내용을 수정했습니다", tone: "success" });
                })
                .catch(() => showToast({ message: "수정에 실패했습니다", tone: "danger" }));
            });
          }}
        >
          {pending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
