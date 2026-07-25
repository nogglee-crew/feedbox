"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";

export function QaSessionAccessToggle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Switch
        label="공개 URL"
        checked
        onChange={(next) => {
          // 비공개 전환은 구독 기능이라 상태를 바꾸지 않고 안내만 띄운다
          if (!next) setOpen(true);
        }}
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="비공개 QA는 준비 중이에요"
        footer={
          <Button size="md" variant="primary" onClick={() => setOpen(false)}>
            확인
          </Button>
        }
      >
        <p className="mt-3 text-sm text-muted">
          지금은 링크를 아는 누구나 피드백을 남길 수 있어요. 초대한 분들만 참여하는 비공개 QA는
          구독 플랜에서 준비하고 있고, 준비되는 대로 알려드릴게요.
        </p>
      </Modal>
    </>
  );
}
