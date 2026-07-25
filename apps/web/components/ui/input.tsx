import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";
import {
  CONTROL_BASE,
  CONTROL_SIZE,
  controlBorder,
  describedBy,
  Field,
  type ControlSize,
} from "./field";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  size?: ControlSize;
  fieldClassName?: string;
}

/** Repeated field names require an explicit id for label association. */
export function Input({
  label,
  hint,
  error,
  success,
  size = "md",
  className,
  fieldClassName,
  id,
  name,
  ...props
}: InputProps) {
  const controlId = id ?? name ?? "";
  const control = (
    <input
      id={controlId || undefined}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(controlId, hint, error, success)}
      className={cn(CONTROL_BASE, CONTROL_SIZE[size], controlBorder(!!error), className)}
      {...props}
    />
  );

  if (!label && !hint && !error && !success) return control;

  return (
    <Field
      id={controlId}
      label={label}
      hint={hint}
      error={error}
      success={success}
      className={fieldClassName}
    >
      {control}
    </Field>
  );
}
