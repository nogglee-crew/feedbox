"use client";

import { useEffect, useState } from "react";
import { Tag } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { LocalTime } from "@/components/ui/local-time";

export interface ChangelogNavItem {
  date: string;
  hasSdk: boolean;
}

/** 좌측 날짜 목록 + 스크롤스파이 — 화면 상단 부근에 있는 날짜 섹션을 하이라이트한다 */
export function ChangelogNav({ items }: { items: ChangelogNavItem[] }) {
  const [active, setActive] = useState(items[0]?.date ?? null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 관찰 밴드(화면 상단 10~40%) 안에 들어온 섹션 중 가장 위의 것을 고른다
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -60% 0px" },
    );
    for (const item of items) {
      const el = document.getElementById(item.date);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="업데이트 날짜" className="hidden lg:block">
      <ul className="sticky top-8 space-y-1 text-sm">
        {items.map((item) => {
          const selected = active === item.date;
          return (
            <li key={item.date} className="relative">
              {selected && (
                <span
                  aria-hidden
                  className="absolute -left-2 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                />
              )}
              <a
                href={`#${item.date}`}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
                  selected
                    ? "bg-surface-hover font-semibold text-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                <LocalTime value={item.date} style="date" className="w-24 shrink-0" />
                {item.hasSdk && <Tag tone="primary">SDK</Tag>}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
