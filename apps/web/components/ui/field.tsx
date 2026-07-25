import type { ReactNode } from "react";
import { cn } from "./cn";

export type ControlSize = "sm" | "md";

export interface FieldProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ id, label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-muted">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export const CONTROL_BASE =
  "rounded-md border bg-surface text-foreground transition-colors " +
  "placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-focus/30 " +
  "disabled:bg-surface-disabled disabled:text-muted";

export const CONTROL_SIZE: Record<ControlSize, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-2 text-sm",
};

export function controlBorder(hasError?: boolean): string {
  return hasError ? "border-danger focus:border-danger focus:ring-danger/30" : "border-border-strong focus:border-focus";
}
