"use client";

import { useState } from "react";
import { deleteAccount } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/ui/submit-button";

/** 계정 설정 최하단에 조용히 두는 탈퇴 진입점. 확인 모달을 거쳐 실행된다 */
export function DeleteAccountSection() {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="text-subtle" onClick={() => setConfirming(true)}>
          탈퇴하기
        </Button>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="정말 탈퇴하시겠어요?"
        footer={
          <>
            <Button onClick={() => setConfirming(false)}>취소</Button>
            <form action={deleteAccount}>
              <SubmitButton variant="dangerSolid" pendingText="탈퇴 처리 중...">
                탈퇴하기
              </SubmitButton>
            </form>
          </>
        }
      >
        <p className="mt-2 text-sm text-muted">
          탈퇴하면 계정과 함께 <b>혼자 속한 팀의 프로젝트·릴리즈·이슈 등 모든 데이터가 삭제</b>
          되며, <b>되돌릴 수 없습니다</b>.
        </p>
        <p className="mt-2 text-xs text-subtle">
          다른 멤버가 있는 팀의 유일한 owner라면, 먼저 owner를 위임해야 탈퇴할 수 있습니다.
        </p>
      </Modal>
    </>
  );
}
