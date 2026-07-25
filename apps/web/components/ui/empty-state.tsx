import type { ReactNode } from "react";
import { cn } from "./cn";

/** 목록이 비었을 때의 안내. 카드/리스트 안에 놓는 것을 전제로 한다 */
export function EmptyState({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("px-5 py-10 text-center text-sm text-subtle", className)}>{children}</p>;
}
