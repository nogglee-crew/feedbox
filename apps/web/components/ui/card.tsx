import type { ReactNode } from "react";
import { cn } from "./cn";

export type CardPadding = "none" | "sm" | "md" | "lg";

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

/**
 * 면 분리는 그림자가 아니라 테두리로 한다. 그림자는 오버레이 전용이다.
 * form·ul·li처럼 div가 아닌 요소를 카드로 만들 때 쓴다.
 */
export function cardClasses(padding: CardPadding = "md"): string {
  return cn("rounded-xl border border-border bg-surface", PADDING[padding]);
}

export function Card({
  padding = "md",
  className,
  children,
}: {
  padding?: CardPadding;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(cardClasses(padding), className)}>{children}</div>;
}
