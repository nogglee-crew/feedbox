"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "./cn";

export function menuItemClasses(className?: string): string {
  return cn(
    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm",
    "hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
    className,
  );
}

interface MenuProps {
  label: string;
  trigger: ReactNode | ((open: boolean) => ReactNode);
  triggerClassName?: string;
  align?: "left" | "right";
  panelClassName?: string;
  children: (close: () => void) => ReactNode;
}

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
