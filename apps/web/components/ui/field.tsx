import type { ReactNode } from "react";
import { cn } from "./cn";

export type ControlSize = "sm" | "md";

export interface FieldProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  /** 검증을 통과했을 때의 확인 문구. error보다 우선순위가 낮다 */
  success?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ id, label, hint, error, success, className, children }: FieldProps) {
  const message = error ?? success ?? hint;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-muted">
          {label}
        </label>
      )}
      {children}
      {message && (
        <p
          id={`${id}-${error ? "error" : success ? "success" : "hint"}`}
          className={cn(
            "text-xs",
            error ? "text-danger" : success ? "text-success" : "text-subtle",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export function describedBy(
  id: string,
  hint?: string,
  error?: string,
  success?: string,
): string | undefined {
  if (error) return `${id}-error`;
  if (success) return `${id}-success`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export const CONTROL_BASE =
  "rounded-md border bg-surface text-foreground transition-colors " +
  "placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-focus/30 " +
  // 메시지를 Field가 직접 그리는 경우에도 테두리가 오류 상태를 따라오게 한다
  "aria-invalid:border-danger aria-invalid:focus:border-danger aria-invalid:focus:ring-danger/30 " +
  "disabled:bg-surface-disabled disabled:text-muted";

export const CONTROL_SIZE: Record<ControlSize, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-2 text-sm",
};

export function controlBorder(hasError?: boolean): string {
  return hasError ? "border-danger focus:border-danger focus:ring-danger/30" : "border-border-strong focus:border-focus";
}
