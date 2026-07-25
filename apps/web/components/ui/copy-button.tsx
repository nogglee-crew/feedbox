"use client";

import { useState } from "react";
import { HiCheck, HiOutlineClipboard } from "react-icons/hi2";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

export function CopyButton({
  value,
  label = "복사",
  variant = "ghost",
  relativeToOrigin = false,
  className,
}: {
  value: string;
  label?: string;
  variant?: ButtonVariant;
  /** value가 경로일 때 현재 origin을 붙여 절대 URL로 복사한다 */
  relativeToOrigin?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant={variant}
      aria-label={copied ? `${label} 복사됨` : `${label} 복사`}
      className={cn(variant === "ghost" && "text-muted", className)}
      onClick={async () => {
        const text = relativeToOrigin ? `${window.location.origin}${value}` : value;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {/* 라벨은 그대로 두고 아이콘만 바꿔야 버튼 폭이 흔들리지 않는다 */}
      {copied ? (
        <HiCheck aria-hidden className="size-3.5 text-success" />
      ) : (
        <HiOutlineClipboard aria-hidden className="size-3.5" />
      )}
      {label}
    </Button>
  );
}
