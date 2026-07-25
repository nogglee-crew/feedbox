"use client";

import { useState } from "react";
import { deleteProject } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/ui/submit-button";

export function DeleteProjectButton({
  orgSlug,
  projectId,
  projectName,
}: {
  orgSlug: string;
  projectId: string;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const matched = confirmName.trim() === projectName;

  const close = () => {
    setConfirmName("");
    setOpen(false);
  };

  return (
    <>
      <Button size="sm" variant="danger" onClick={() => setOpen(true)}>
        프로젝트 삭제
      </Button>
      <Modal open={open} onClose={close} title="프로젝트를 삭제할까요?">
        <div className="mt-3 space-y-3 text-sm text-muted">
          <p>
            <b className="text-foreground">{projectName}</b> 프로젝트와 함께 아래 항목이 모두
            삭제되며, <b className="text-foreground">되돌릴 수 없습니다.</b>
          </p>
          <ul className="list-inside list-disc space-y-1 rounded-lg bg-surface-muted p-3 text-xs">
            <li>모든 릴리즈와 이슈</li>
            <li>발급한 QA URL과 이슈 보드 링크</li>
            <li>업로드된 스크린샷 파일</li>
          </ul>
          <p className="text-xs">
            이미 공유한 QA URL과 이슈 보드 링크는 즉시 열리지 않습니다.
          </p>
        </div>

        <form action={deleteProject} className="mt-4 space-y-3">
          <input type="hidden" name="org_slug" value={orgSlug} />
          <input type="hidden" name="id" value={projectId} />
          <Input
            id="delete-project-confirm"
            name="confirm_name"
            label={`확인을 위해 "${projectName}"을 입력하세요`}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            autoComplete="off"
            className="w-full"
          />
          <div className="flex justify-end gap-2">
            <Button onClick={close}>취소</Button>
            <SubmitButton variant="dangerSolid" disabled={!matched} pendingText="삭제 중...">
              삭제하기
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
