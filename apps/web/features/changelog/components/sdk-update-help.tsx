"use client";

import { useState } from "react";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { IconButton } from "@/components/ui/button";
import { CopyText } from "@/components/ui/copy-text";
import { Modal } from "@/components/ui/modal";

/**
 * SDK 항목 옆 물음표 — 새 버전이 자동 반영된다고 오해하기 쉬워서,
 * lockfile 갱신 + 재배포가 필요하다는 것을 모달로 안내한다.
 */
export function SdkUpdateHelp({ version }: { version: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        label="SDK 업데이트 적용 방법"
        icon={<HiOutlineQuestionMarkCircle className="size-4" />}
        size="sm"
        onClick={() => setOpen(true)}
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="SDK 업데이트는 어떻게 적용되나요?"
        className="max-w-xl"
      >
        {/* 소제목(h3) 안에 렌더되므로 상속되는 굵기를 명시적으로 되돌린다 */}
        <div className="mt-2 space-y-4 text-sm font-normal text-muted">
          <p>
            새 버전이 나와도 쓰고 계신 서비스에 자동으로 적용되지 않아요.
            <br />
            서비스는 처음 설치할 때 받은 SDK 버전을 그대로 쓰고 있거든요.
          </p>
          <p>
            프로젝트에서 아래 명령을 실행하고, 서비스를 다시 배포하면 적용됩니다.
          </p>
          <p>
            <CopyText value="npm install @nogglee/feedbox@latest" />
          </p>
          <p className="text-xs text-subtle">
            코딩 에이전트를 쓰신다면 &ldquo;FEEDBOX SDK를 최신 버전으로 올리고 배포해줘&rdquo;라고
            요청해도 됩니다.
            <br />이 항목의 변경은 {version} 버전부터 들어 있어요.
          </p>
        </div>
      </Modal>
    </>
  );
}
