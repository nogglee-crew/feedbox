"use client";

import { useState } from "react";
import { addOrgMember, transferOwnershipAction } from "@/app/org-actions";
import { Button } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";

export function AddMemberForm({
  orgId,
  orgSlug,
  callerEmail,
}: {
  orgId: string;
  orgSlug: string;
  callerEmail: string;
}) {
  // owner로 지정하려는 대상 이메일. 값이 있으면 이전 확인 모달을 연다
  const [pendingOwner, setPendingOwner] = useState<string | null>(null);

  return (
    <>
      <form
        action={(formData) => {
          const email = String(formData.get("email") ?? "").trim();
          // owner 지정은 소유권 이전이라 바로 실행하지 않고 경고 모달을 먼저 띄운다
          if (formData.get("role") === "owner") {
            if (email) setPendingOwner(email);
            return;
          }
          return addOrgMember(formData);
        }}
        className={`${cardClasses("sm")} flex flex-wrap items-end gap-3`}
      >
        <input type="hidden" name="org_id" value={orgId} />
        <input type="hidden" name="org_slug" value={orgSlug} />
        <Input
          label="이메일 (Google 계정)"
          name="email"
          type="email"
          required
          placeholder="teammate@company.com"
          className="w-72"
        />
        <Select label="역할" name="role" defaultValue="member">
          <option value="member">member</option>
          <option value="owner">owner</option>
        </Select>
        <SubmitButton pendingText="추가 중...">멤버 추가</SubmitButton>
      </form>

      <Modal
        open={pendingOwner !== null}
        onClose={() => setPendingOwner(null)}
        title="소유권을 이전할까요?"
      >
        <div className="mt-3 space-y-3 text-sm text-muted">
          <p>
            <b className="text-foreground">{pendingOwner}</b>님을 owner로 지정하면,{" "}
            <b className="text-foreground">회원님({callerEmail})은 member로 강등</b>됩니다.
          </p>
          <p className="text-xs">
            팀의 owner는 한 명입니다. 되돌리려면 새 owner가 다시 회원님을 owner로 지정해야 합니다.
            아직 로그인하지 않은 이메일로 이전하면, 그 계정이 로그인하기 전까지 owner 권한을 쓸 수
            없습니다.
          </p>
        </div>

        <form action={transferOwnershipAction} className="mt-4">
          <input type="hidden" name="org_id" value={orgId} />
          <input type="hidden" name="org_slug" value={orgSlug} />
          <input type="hidden" name="email" value={pendingOwner ?? ""} />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setPendingOwner(null)}>취소</Button>
            <SubmitButton variant="dangerSolid" pendingText="이전 중...">
              지정하고 member 되기
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
