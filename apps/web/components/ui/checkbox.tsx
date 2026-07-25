import type { InputHTMLAttributes, ReactNode } from "react";
import { HiCheck } from "react-icons/hi2";
import { cn } from "./cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: ReactNode;
  /** 라벨 아래 작은 보조 설명 */
  description?: ReactNode;
  /** 라벨까지 감싸는 레이아웃 클래스 */
  fieldClassName?: string;
}

/**
 * 네이티브 input을 그대로 두고 appearance-none으로 칠한다.
 * sr-only로 감추면 required 검증 말풍선이 갈 곳을 잃는다.
 */
export function Checkbox({
  label,
  description,
  className,
  fieldClassName,
  id,
  name,
  ...props
}: CheckboxProps) {
  const controlId = id ?? name ?? "";

  return (
    <label className={cn("flex cursor-pointer items-start gap-2 text-xs text-muted", fieldClassName)}>
      <span className="relative mt-0.5 flex shrink-0">
        <input
          type="checkbox"
          id={controlId || undefined}
          name={name}
          className={cn(
            "peer size-4 appearance-none rounded border border-border-strong bg-surface transition-colors",
            "checked:border-primary checked:bg-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            "disabled:opacity-50",
            className,
          )}
          {...props}
        />
        <HiCheck
          aria-hidden
          className="pointer-events-none absolute inset-0 size-4 p-px text-transparent peer-checked:text-on-primary"
        />
      </span>
      <span>
        {label}
        {description && <span className="mt-0.5 block text-subtle">{description}</span>}
      </span>
    </label>
  );
}
