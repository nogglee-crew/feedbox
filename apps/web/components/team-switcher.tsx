"use client";

import { useState } from "react";
import { setActiveOrg } from "@/app/org-actions";
import { PlanBadge, RoleBadge } from "@/components/badge";
import { CreateTeamModal } from "@/components/create-team";

export interface TeamOption {
  id: string;
  name: string;
  paid: boolean;
  role: "owner" | "member";
}

/** 메인 상단 팀명 헤딩 — arrow-down 클릭으로 팀 전환 */
export function TeamSwitcher({ teams, activeId }: { teams: TeamOption[]; activeId: string }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const active = teams.find((t) => t.id === activeId) ?? teams[0];
  const others = teams.filter((t) => t.id !== activeId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-1 py-0.5 hover:bg-surface-hover"
      >
        <span className="text-2xl font-bold">{active.name}</span>
        <PlanBadge paid={active.paid} />
        <RoleBadge role={active.role} />
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`text-subtle transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="닫기"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 z-20 mt-2 w-72 rounded-xl border border-border bg-surface p-2 shadow-lg">
            {others.map((team) => (
              <form key={team.id} action={setActiveOrg}>
                <input type="hidden" name="org_id" value={team.id} />
                <button className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-surface-hover">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{team.name}</span>
                    <PlanBadge paid={team.paid} />
                    <RoleBadge role={team.role} />
                  </span>
                </button>
              </form>
            ))}
            {others.length === 0 && (
              <p className="px-3 py-2.5 text-sm text-subtle">전환할 팀이 없습니다.</p>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCreating(true);
              }}
              className="mt-1 w-full rounded-lg border-t border-border-subtle px-3 py-2.5 text-left text-sm font-semibold text-primary hover:bg-primary-subtle"
            >
              + 팀 추가
            </button>
          </div>
        </>
      )}

      <CreateTeamModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
