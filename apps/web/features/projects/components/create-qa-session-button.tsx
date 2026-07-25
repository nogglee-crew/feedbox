"use client";

import { useState } from "react";
import { createQaSession } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export function CreateQaSessionButton({
  projectId,
  orgSlug,
  releaseId,
}: {
  orgSlug: string;
  projectId: string;
  releaseId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        URL 발급
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="URL 발급">
        <p className="mt-1 text-sm text-muted">
          발급한 URL로 테스터가 피드백을 남기고, 고객사는 이슈 보드를 열람합니다.
        </p>
        <form
          // 액션이 성공했을 때만 닫아야 실패를 놓치지 않는다
          action={async (formData) => {
            await createQaSession(formData);
            setOpen(false);
          }}
          className="mt-4 space-y-3"
        >
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="org_slug" value={orgSlug} />
          <input type="hidden" name="release_id" value={releaseId} />
          <Input
            id="qa-session-created-by"
            label="발급 대상 (선택)"
            name="created_by"
            placeholder="예: 고객사 QA팀"
            className="w-full"
          />
          <Input
            id="qa-session-days"
            label="유효기간 (일)"
            name="days"
            type="number"
            defaultValue={7}
            min={1}
            max={90}
            className="w-full"
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>취소</Button>
            <Button type="submit" variant="primary">
              발급
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
