import type { ReactNode, SelectHTMLAttributes } from "react";
import { HiChevronDown } from "react-icons/hi2";
import { cn } from "./cn";
import {
  CONTROL_BASE,
  CONTROL_SIZE,
  controlBorder,
  describedBy,
  Field,
  type ControlSize,
} from "./field";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  size?: ControlSize;
  adornment?: ReactNode;
  fieldClassName?: string;
}

export function Select({
  label,
  hint,
  error,
  size = "md",
  adornment,
  className,
  fieldClassName,
  id,
  name,
  children,
  ...props
}: SelectProps) {
  const controlId = id ?? name ?? "";
  const compact = size === "sm";
  const control = (
    <div className="relative">
      {adornment && (
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 z-10 -translate-y-1/2",
            compact ? "left-2" : "left-3",
          )}
        >
          {adornment}
        </span>
      )}
      <select
        id={controlId || undefined}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(controlId, hint, error)}
        className={cn(
          CONTROL_BASE,
          CONTROL_SIZE[size],
          controlBorder(!!error),
          "w-full appearance-none",
          compact ? "pr-6" : "pr-8",
          adornment ? (compact ? "pl-6" : "pl-8") : undefined,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <HiChevronDown
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-subtle",
          compact ? "right-1.5 size-3.5" : "right-2.5 size-4",
        )}
      />
    </div>
  );

  if (!label && !hint && !error) return control;

  return (
    <Field id={controlId} label={label} hint={hint} error={error} className={fieldClassName}>
      {control}
    </Field>
  );
}
