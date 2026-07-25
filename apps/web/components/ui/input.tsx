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
  size?: ControlSize;
  /** 필드 전체(라벨 포함)에 적용할 레이아웃 클래스 */
  fieldClassName?: string;
}

/**
 * 라벨을 주면 htmlFor 연결까지 함께 처리한다.
 * id를 생략하면 name을 쓰므로, 한 페이지에 같은 name이 반복되면 id를 직접 넘겨야 한다.
 */
export function Input({
  label,
  hint,
  error,
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
