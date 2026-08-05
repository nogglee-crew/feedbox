"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiChevronRight } from "react-icons/hi2";
import { signOut } from "@/app/auth/actions";
import { PlanBadge } from "@/features/billing/components/plan-badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/components/ui/cn";
import { Menu, menuItemClasses } from "@/components/ui/menu";
import { OPEN_CHAT_URL } from "@/components/site-footer";

interface ProfileTeam {
  name: string;
  slug: string;
  paid: boolean;
}

export function ProfileMenu({
  name,
  email,
  avatarUrl,
  team,
  teams = [],
  changelogUnread = false,
}: {
  name: string | null;
  email: string;
  avatarUrl: string | null;
  team: ProfileTeam | null;
  teams?: ProfileTeam[];
  changelogUnread?: boolean;
}) {
  const pathname = usePathname();
  const displayName = name ?? email;
  const activeSlug = pathname.split("/").filter(Boolean)[0];
  const activeTeam = teams.find((candidate) => candidate.slug === activeSlug) ?? team;

  return (
    <Menu
      label="계정 메뉴"
      align="right"
      triggerClassName={cn(
        "flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 hover:bg-surface-hover",
        // 미확인 업데이트가 있으면 두근거림으로 메뉴를 열고 싶게 만든다
        changelogUnread && "heartbeat",
      )}
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

          {activeTeam && (
            <Link href={`/${activeTeam.slug}/settings/teams`} onClick={close} className={menuItemClasses("mt-1")}>
              <span>
                <span className="block text-xs text-subtle">선택된 팀</span>
                <span className="mt-0.5 flex items-center gap-2 text-sm font-semibold">
                  {activeTeam.name}
                  <PlanBadge paid={activeTeam.paid} />
                </span>
              </span>
              <HiChevronRight aria-hidden className="size-4 text-subtle" />
            </Link>
          )}

          <Link href="/account" onClick={close} className={menuItemClasses()}>
            계정 설정
          </Link>
          <Link href="/changelog" onClick={close} className={menuItemClasses()}>
            <span className="relative">
              업데이트
              {changelogUnread && (
                <span
                  aria-hidden
                  className="absolute -right-2 top-0 size-1.5 rounded-full bg-primary"
                />
              )}
            </span>
          </Link>
          <Link href="/" onClick={close} className={menuItemClasses()}>
            피드박스 소개
          </Link>
          <a
            href={OPEN_CHAT_URL}
            target="_blank"
            rel="noreferrer"
            onClick={close}
            className={menuItemClasses()}
          >
            문의하기
          </a>
          <form action={signOut}>
            <button type="submit" className={menuItemClasses()}>
              로그아웃
            </button>
          </form>
        </>
      )}
    </Menu>
  );
}

export function DashboardHomeLink({ teams }: { teams: ProfileTeam[] }) {
  const pathname = usePathname();
  const activeSlug = pathname.split("/").filter(Boolean)[0];
  const activeTeam = teams.find((candidate) => candidate.slug === activeSlug);

  return (
    <Link
      href={activeTeam ? `/${activeTeam.slug}/projects` : "/projects"}
      aria-label="FEEDBOX 홈"
    >
      <Image
        src="/feedbox-logo.png"
        alt="FEEDBOX"
        width={1468}
        height={284}
        priority
        className="h-6 w-auto"
      />
    </Link>
  );
}
