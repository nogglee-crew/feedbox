"use client";

import { useState } from "react";
import { createOrganization } from "@/app/org-actions";

/** 팀 생성 모달 — 팀 스위처와 팀 관리 페이지에서 재사용 */
export function CreateTeamModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6">
        <h2 className="text-lg font-bold">새 팀 만들기</h2>
        <p className="mt-1 text-sm text-muted">
          프로젝트는 팀 단위로 관리됩니다. 팀 이름을 입력하세요.
        </p>
        <form action={createOrganization} className="mt-4 space-y-3">
          <input
            name="name"
            required
            autoFocus
            placeholder="예: 노글리 팀"
            className="w-full rounded-md border border-border-strong px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border-strong px-4 py-2 text-sm hover:bg-surface-hover"
            >
              취소
            </button>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-hover">
              팀 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** "팀 생성" 버튼 + 모달 (팀 관리 페이지 헤딩 옆에 배치) */
export function CreateTeamButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-hover"
      >
        팀 생성
      </button>
      <CreateTeamModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
