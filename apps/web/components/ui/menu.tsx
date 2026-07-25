"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "./cn";

/** 메뉴 안의 행. Link·button·form 안의 button 어디에나 붙일 수 있다 */
export function menuItemClasses(className?: string): string {
  return cn(
    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm",
    "hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
    className,
  );
}

interface MenuProps {
  /** 트리거의 접근성 이름 */
  label: string;
  trigger: ReactNode | ((open: boolean) => ReactNode);
  triggerClassName?: string;
  align?: "left" | "right";
  /** 패널 폭 등 레이아웃 조정 */
  panelClassName?: string;
  children: (close: () => void) => ReactNode;
}

/** 드롭다운. 오버레이이므로 그림자를 쓰고, 바깥 클릭과 Esc로 닫힌다 */
export function Menu({
  label,
  trigger,
  triggerClassName,
  align = "left",
  panelClassName,
  children,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          triggerClassName,
        )}
      >
        {typeof trigger === "function" ? trigger(open) : trigger}
      </button>

      {open && (
        <>
          {/* 바깥 클릭으로 닫기. 커서는 그대로 두어 눌러야 할 곳처럼 보이지 않게 한다 */}
          <button
            type="button"
            aria-label="닫기"
            className="fixed inset-0 z-10 cursor-default"
            onClick={close}
          />
          <div
            className={cn(
              "absolute z-20 mt-2 w-72 rounded-xl border border-border bg-surface p-2 shadow-lg",
              align === "right" ? "right-0" : "left-0",
              panelClassName,
            )}
          >
            {children(close)}
          </div>
        </>
      )}
    </div>
  );
}
