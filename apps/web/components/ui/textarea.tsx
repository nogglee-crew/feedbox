import type { TextareaHTMLAttributes } from "react";
import { cn } from "./cn";
import {
  CONTROL_BASE,
  CONTROL_SIZE,
  controlBorder,
  describedBy,
  Field,
  type ControlSize,
} from "./field";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  size?: ControlSize;
  fieldClassName?: string;
}

/** Input과 같은 표면·포커스·에러 처리를 공유한다 */
export function Textarea({
  label,
  hint,
  error,
  size = "md",
  className,
  fieldClassName,
  id,
  name,
  ...props
}: TextareaProps) {
  const controlId = id ?? name ?? "";
  const control = (
    <textarea
      id={controlId || undefined}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(controlId, hint, error)}
      className={cn(CONTROL_BASE, CONTROL_SIZE[size], controlBorder(!!error), className)}
      {...props}
    />
  );

  if (!label && !hint && !error) return control;

  return (
    <Field id={controlId} label={label} hint={hint} error={error} className={fieldClassName}>
      {control}
    </Field>
  );
}
