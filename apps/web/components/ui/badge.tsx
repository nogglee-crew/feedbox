import type { ReactNode } from "react";
import { cn } from "./cn";

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const DOT: Record<Tone, string> = {
  neutral: "bg-subtle",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

const TINT: Record<Tone, string> = {
  neutral: "bg-surface-muted text-muted",
  primary: "bg-primary-subtle text-primary-strong",
  success: "bg-success-subtle text-success-strong",
  warning: "bg-warning-subtle text-warning-strong",
  danger: "bg-danger-subtle text-danger-strong",
  info: "bg-info-subtle text-info-strong",
};

export function Dot({ tone = "neutral", className }: { tone?: Tone; className?: string }) {
  return <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", DOT[tone], className)} />;
}

/**
 * 시간에 따라 변하는 상태(이슈 진행도, 세션 활성 여부 등).
 * 배경은 항상 무채색이고 의미는 점의 색이 갖는다.
 */
export function StatusBadge({
  tone,
  /** 주의가 필요한 상태만 글자를 진하게 한다 */
  emphasis,
  className,
  children,
}: {
  tone: Tone;
  emphasis?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold",
        emphasis ? "text-foreground" : "text-muted",
        className,
      )}
    >
      <Dot tone={tone} />
      {children}
    </span>
  );
}

/**
 * 변하지 않는 분류 라벨(역할, 플랜 등).
 * 상태가 아니므로 점을 붙이지 않고, 배지와 구분되게 둥근 사각형을 쓴다.
 */
export function Tag({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold lowercase",
        TINT[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
