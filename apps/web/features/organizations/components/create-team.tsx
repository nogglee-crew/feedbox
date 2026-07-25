"use client";

import { useState } from "react";
import { createOrganization } from "@/app/org-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

/** 팀 생성 모달 — 팀 스위처와 팀 관리 페이지에서 재사용 */
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
          <Button type="submit" variant="primary">
            팀 생성
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** "팀 생성" 버튼 + 모달 (팀 관리 페이지 헤딩 옆에 배치) */
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
