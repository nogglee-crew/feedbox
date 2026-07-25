"use client";

import { useState } from "react";
import { HiCheck, HiOutlineClipboard } from "react-icons/hi2";
import { cn } from "@/components/ui/cn";

/** 값 자체를 눌러서 복사하는 인라인 텍스트. 폭이 흔들리지 않도록 라벨은 그대로 둔다 */
export function CopyText({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={copied ? `${value} 복사됨` : `${value} 복사`}
      title="클릭해서 복사"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded font-semibold text-foreground underline decoration-border-strong underline-offset-2 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        className,
      )}
    >
      {value}
      {copied ? (
        <HiCheck aria-hidden className="size-3.5 text-success" />
      ) : (
        <HiOutlineClipboard aria-hidden className="size-3.5 text-subtle" />
      )}
    </button>
  );
}
