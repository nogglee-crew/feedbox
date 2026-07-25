"use client";

import { useId } from "react";
import { cn } from "./cn";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** 라벨을 시각적으로 숨기고 접근성 이름으로만 쓴다 */
  labelHidden?: boolean;
  disabled?: boolean;
  className?: string;
}

/** 켜짐/꺼짐 상태를 나타내는 컨트롤. 선택이 아니라 상태이므로 체크박스가 아닌 스위치를 쓴다 */
export function Switch({ checked, onChange, label, labelHidden, disabled, className }: SwitchProps) {
  const labelId = useId();

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {!labelHidden && (
        <span id={labelId} className="text-xs font-semibold text-muted">
          {label}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={labelHidden ? label : undefined}
        aria-labelledby={labelHidden ? undefined : labelId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          // 트랙 좌우 여백을 px-0.5로 잡아야 켜짐/꺼짐 양쪽 간격이 2px로 같아진다
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "disabled:opacity-50",
          checked ? "bg-primary" : "bg-border-strong",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "size-4 rounded-full bg-surface shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
    </span>
  );
}
