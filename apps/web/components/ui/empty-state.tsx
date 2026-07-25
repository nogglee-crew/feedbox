import type { ReactNode } from "react";
import { cn } from "./cn";

export function EmptyState({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("px-5 py-10 text-center text-sm text-subtle", className)}>{children}</p>;
}
