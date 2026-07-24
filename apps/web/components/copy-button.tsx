"use client";

import { useState } from "react";

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
    <button
      type="button"
      className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
      onClick={async () => {
        const text = relativeToOrigin ? `${window.location.origin}${value}` : value;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "복사됨!" : label}
    </button>
  );
}
