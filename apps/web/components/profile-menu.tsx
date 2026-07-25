"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteAccount, signOut } from "@/app/auth/actions";
import { PlanBadge } from "@/components/badge";

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
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const displayName = name ?? email;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 hover:bg-surface-hover"
      >
        {avatarUrl ? (
          // Google 프로필 이미지는 referrer 정책 때문에 no-referrer가 필요하다
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-subtle text-xs font-bold text-primary-strong">
            {displayName.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="text-sm font-semibold text-foreground">{displayName}</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-border bg-surface p-2 shadow-lg">
            <div className="border-b border-border-subtle px-3 py-3">
              <div className="text-sm font-semibold">{displayName}</div>
              <div className="mt-0.5 text-xs text-muted">{email}</div>
            </div>

            {team && (
              <Link
                href="/settings/teams"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-surface-hover"
              >
                <div>
                  <div className="text-xs text-subtle">선택된 팀</div>
                  <div className="mt-0.5 flex items-center gap-2 text-sm font-semibold">
                    {team.name}
                    <PlanBadge paid={team.paid} />
                  </div>
                </div>
                <span className="text-xs text-subtle">관리 →</span>
              </Link>
            )}

            <form action={signOut}>
              <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-hover">
                로그아웃
              </button>
            </form>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger-subtle"
            >
              회원탈퇴
            </button>
          </div>
        </>
      )}

      {confirmingDelete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6">
            <h2 className="text-lg font-bold">정말 탈퇴하시겠어요?</h2>
            <p className="mt-2 text-sm text-muted">
              탈퇴하면 계정과 함께 <b>혼자 속한 팀의 프로젝트·릴리즈·이슈 등 모든 데이터가 삭제</b>
              되며, <b>되돌릴 수 없습니다</b>.
            </p>
            <p className="mt-2 text-xs text-subtle">
              다른 멤버가 있는 팀의 유일한 owner라면, 먼저 owner를 위임해야 탈퇴할 수 있습니다.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-md border border-border-strong px-4 py-2 text-sm hover:bg-surface-hover"
              >
                취소
              </button>
              <form action={deleteAccount}>
                <button className="rounded-md bg-danger px-4 py-2 text-sm font-semibold text-on-danger hover:bg-danger-hover">
                  탈퇴하기
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
