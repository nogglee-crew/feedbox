import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

/**
 * 색은 화면당 하나의 주요 액션에만 쓴다.
 * - primary: 그 화면에서 사용자가 다음에 눌러야 할 단 하나의 버튼
 * - secondary: 기본값. 나머지 모든 액션
 * - ghost: 목록/툴바 안의 보조 액션. 테두리 없음
 * - danger: 파괴적 액션의 진입점. 색은 글자에만
 * - dangerSolid: 되돌릴 수 없는 최종 확인 버튼에만
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerSolid";
export type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active",
  secondary: "border border-border-strong bg-surface hover:bg-surface-hover active:bg-surface-active",
  ghost: "hover:bg-surface-hover active:bg-surface-active",
  danger: "border border-danger-muted text-danger hover:bg-danger-subtle",
  dangerSolid: "bg-danger text-on-danger hover:bg-danger-hover active:bg-danger-active",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "gap-1.5 rounded-md px-2.5 py-1 text-xs",
  md: "gap-2 rounded-md px-4 py-2 text-sm",
};

const BASE =
  "inline-flex items-center justify-center font-semibold transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface " +
  "disabled:opacity-50";

/** Link를 버튼처럼 보이게 할 때 사용한다. 실제 버튼이면 <Button>을 쓸 것 */
export function buttonClasses(variant: ButtonVariant = "secondary", size: ButtonSize = "md"): string {
  return cn(BASE, VARIANTS[variant], SIZES[size]);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 폭 등 레이아웃 클래스만 전달한다 */
  className?: string;
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={cn(buttonClasses(variant, size), className)} {...props} />;
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** 접근성 이름 겸 툴팁. 아이콘만 있는 버튼이므로 필수 */
  label: string;
  icon: ReactNode;
  size?: ButtonSize;
  className?: string;
}

/** 아이콘 단독 버튼. DESIGN.md에 따라 ghost로만 제공한다 */
export function IconButton({ label, icon, size = "md", className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        BASE,
        VARIANTS.ghost,
        "rounded-md text-muted hover:text-foreground",
        size === "sm" ? "p-1" : "p-1.5",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
