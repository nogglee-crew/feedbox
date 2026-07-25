import type { ReactNode } from "react";
import { cn } from "./cn";

export function Code({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <code className={cn("rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-foreground", className)}>
      {children}
    </code>
  );
}
