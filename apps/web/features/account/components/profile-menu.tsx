"use client";

import Link from "next/link";
import { useState } from "react";
import { HiChevronRight } from "react-icons/hi2";
import { deleteAccount, signOut } from "@/app/auth/actions";
import { PlanBadge } from "@/features/billing/components/plan-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, menuItemClasses } from "@/components/ui/menu";
import { Modal } from "@/components/ui/modal";

interface ProfileTeam {
  name: string;
  paid: boolean;
}

export function ProfileMenu({
  name,
  email,
  avatarUrl,
  team,
}: {
  name: string | null;
  email: string;
  avatarUrl: string | null;
  team: ProfileTeam | null;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const displayName = name ?? email;

  return (
    <>
      <Menu
        label="계정 메뉴"
        align="right"
        triggerClassName="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 hover:bg-surface-hover"
        trigger={
          <>
            <Avatar name={displayName} src={avatarUrl} size="lg" />
            <span className="text-sm font-semibold text-foreground">{displayName}</span>
          </>
        }
      >
        {(close) => (
          <>
            <div className="border-b border-border-subtle px-3 py-3">
              <div className="text-sm font-semibold">{displayName}</div>
              <div className="mt-0.5 text-xs text-muted">{email}</div>
            </div>

            {team && (
              <Link href="/settings/teams" onClick={close} className={menuItemClasses("mt-1")}>
                <span>
                  <span className="block text-xs text-subtle">선택된 팀</span>
                  <span className="mt-0.5 flex items-center gap-2 text-sm font-semibold">
                    {team.name}
                    <PlanBadge paid={team.paid} />
                  </span>
                </span>
                <HiChevronRight aria-hidden className="size-4 text-subtle" />
              </Link>
            )}

            <form action={signOut}>
              <button type="submit" className={menuItemClasses()}>
                로그아웃
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                close();
                setConfirmingDelete(true);
              }}
              className={menuItemClasses("text-danger hover:bg-danger-subtle")}
            >
              회원탈퇴
            </button>
          </>
        )}
      </Menu>

      <Modal
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title="정말 탈퇴하시겠어요?"
        footer={
          <>
            <Button onClick={() => setConfirmingDelete(false)}>취소</Button>
            <form action={deleteAccount}>
              <Button type="submit" variant="dangerSolid">
                탈퇴하기
              </Button>
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
