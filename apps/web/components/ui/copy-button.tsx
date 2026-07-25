"use client";

import { useState } from "react";
import { HiCheck, HiOutlineClipboard } from "react-icons/hi2";
import { Button } from "@/components/ui/button";

export function CopyButton({
  value,
  label = "복사",
  relativeToOrigin = false,
}: {
  value: string;
  label?: string;
  /** value가 경로일 때 현재 origin을 붙여 절대 URL로 복사한다 */
  relativeToOrigin?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-muted"
      onClick={async () => {
        const text = relativeToOrigin ? `${window.location.origin}${value}` : value;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? (
        <HiCheck aria-hidden className="size-3.5 text-success" />
      ) : (
        <HiOutlineClipboard aria-hidden className="size-3.5" />
      )}
      {copied ? "복사됨!" : label}
    </Button>
  );
}
