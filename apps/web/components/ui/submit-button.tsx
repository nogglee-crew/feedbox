"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { HiOutlineArrowPath } from "react-icons/hi2";
import { Button, type ButtonSize, type ButtonVariant } from "./button";

interface SubmitButtonProps {
  children: ReactNode;
  /** 제출 중에 보여줄 문구. 생략하면 children을 그대로 쓰되 스피너만 붙는다 */
  pendingText?: ReactNode;
  /** 제출 조건 미충족 등 폼 외적인 비활성화 사유 */
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/**
 * 감싼 form이 제출 중이면 자동으로 비활성화 + 스피너를 표시한다.
 * 반드시 <form> 내부에서 사용해야 useFormStatus가 동작한다.
 */
export function SubmitButton({
  children,
  pendingText,
  disabled,
  variant = "primary",
  size,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending || disabled}
      aria-busy={pending}
    >
      {pending && <HiOutlineArrowPath aria-hidden className="size-4 animate-spin" />}
      {pending ? (pendingText ?? children) : children}
    </Button>
  );
}
