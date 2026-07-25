"use client";

import { useState } from "react";
import { HiChevronDown } from "react-icons/hi2";
import Link from "next/link";
import { PlanBadge } from "@/features/billing/components/plan-badge";
import { RoleBadge } from "@/features/organizations/components/role-badge";
import { CreateTeamModal } from "@/features/organizations/components/create-team";
import { Menu, menuItemClasses } from "@/components/ui/menu";

export interface TeamOption {
  id: string;
  slug: string;
  name: string;
  paid: boolean;
  role: "owner" | "member";
}

export function TeamSwitcher({ teams, activeId }: { teams: TeamOption[]; activeId: string }) {
  const [creating, setCreating] = useState(false);
  const active = teams.find((t) => t.id === activeId) ?? teams[0];
  const others = teams.filter((t) => t.id !== activeId);

  return (
    <>
      <Menu
        label="팀 전환"
        triggerClassName="flex items-center gap-2 rounded-lg px-1 py-0.5 hover:bg-surface-hover"
        trigger={(open) => (
          <>
            <span className="text-2xl font-bold">{active.name}</span>
            <PlanBadge paid={active.paid} />
            <RoleBadge role={active.role} />
            <HiChevronDown
              aria-hidden
              className={`size-4 text-subtle transition-[rotate] ${open ? "rotate-180" : ""}`}
            />
          </>
        )}
      >
        {(close) => (
          <>
            {others.map((team) => (
              <Link key={team.id} href={`/${team.slug}/projects`} className={menuItemClasses()}>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{team.name}</span>
                    <PlanBadge paid={team.paid} />
                    <RoleBadge role={team.role} />
                  </span>
              </Link>
            ))}
            {others.length === 0 && (
              <p className="px-3 py-2.5 text-sm text-subtle">전환할 팀이 없습니다.</p>
            )}
            <button
              type="button"
              onClick={() => {
                close();
                setCreating(true);
              }}
              className={menuItemClasses("mt-1 border-t border-border-subtle font-semibold")}
            >
              + 팀 추가
            </button>
          </>
        )}
      </Menu>

      <CreateTeamModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
