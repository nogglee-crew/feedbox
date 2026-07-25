import type { ReactNode } from "react";
import { cn } from "./cn";

export type CardPadding = "none" | "sm" | "md" | "lg";

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

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
