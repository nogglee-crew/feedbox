"use client";

import { useId, useState, type ReactNode } from "react";
import { HiChevronDown } from "react-icons/hi2";
import { cn } from "./cn";

interface CollapsibleSectionProps {
  title: string;
  /** 제목 줄 오른쪽에 놓을 액션 */
  action?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  action,
  defaultOpen = true,
  className,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={contentId}
            onClick={() => setOpen((v) => !v)}
            className="-ml-1 flex items-center gap-1 rounded-md px-1 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {title}
            <HiChevronDown
              aria-hidden
              className={cn("size-5 text-subtle transition-[rotate]", !open && "-rotate-90")}
            />
          </button>
        </h2>
        {action}
      </div>
      {/* 접어도 children을 언마운트하지 않아 서버에서 내려온 목록을 다시 받지 않는다 */}
      <div id={contentId} hidden={!open}>
        {children}
      </div>
    </section>
  );
}
