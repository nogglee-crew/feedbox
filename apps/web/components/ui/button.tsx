import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

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

/** Shared classes for links that act as buttons. */
export function buttonClasses(variant: ButtonVariant = "secondary", size: ButtonSize = "md"): string {
  return cn(BASE, VARIANTS[variant], SIZES[size]);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
  label: string;
  icon: ReactNode;
  size?: ButtonSize;
  className?: string;
}

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
