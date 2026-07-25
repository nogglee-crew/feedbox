"use client";

import { useState } from "react";
import { createOrganization } from "@/app/org-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/ui/submit-button";

export function CreateTeamModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="새 팀 만들기">
      <p className="mt-1 text-sm text-muted">프로젝트는 팀 단위로 관리됩니다. 팀 이름을 입력하세요.</p>
      <form action={createOrganization} className="mt-4 space-y-3">
        <Input
          id="create-team-name"
          name="name"
          required
          autoFocus
          placeholder="예: 노글리 팀"
          className="w-full"
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>취소</Button>
          <SubmitButton pendingText="생성 중...">팀 생성</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}

export function CreateTeamButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        팀 생성
      </Button>
      <CreateTeamModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
