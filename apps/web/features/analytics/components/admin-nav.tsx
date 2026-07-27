"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";

export interface AdminNavItem {
  href: string;
  label: string;
}

/**
 * 현재 위치 표시에 경로가 필요해 이 부분만 클라이언트로 둔다.
 * `/admin`은 하위 경로의 접두사이기도 해서 개요만 정확히 일치할 때 활성으로 본다.
 */
export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto text-sm">
      {items.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-md px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              isActive
                ? "bg-surface-muted font-medium text-foreground"
                : "text-muted hover:bg-surface-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
