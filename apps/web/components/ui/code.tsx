import type { ReactNode } from "react";
import { cn } from "./cn";

/** projectKey, selector, QA URL처럼 그대로 읽어야 하는 값 */
export function Code({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <code className={cn("rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-foreground", className)}>
      {children}
    </code>
  );
}
