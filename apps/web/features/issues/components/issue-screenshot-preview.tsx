import { cn } from "@/components/ui/cn";

export function IssueScreenshotPreview({
  issueId,
  screenshotUrl,
  maxHeight = "md",
  fill = false,
}: {
  issueId: number;
  screenshotUrl: string;
  maxHeight?: "sm" | "md";
  /** 옆 컬럼이 길어지면 남는 높이를 채운다 */
  fill?: boolean;
}) {
  const maxHeightClass = maxHeight === "sm" ? "max-h-48" : "max-h-64";

  return (
    <a
      href={screenshotUrl}
      target="_blank"
      rel="noreferrer"
      // flex-1(basis 0)을 쓰면 늘어날 여백이 없을 때 높이가 무너지므로 grow만 준다
      className={cn(
        "group relative block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        fill && "grow",
      )}
      aria-label={`이슈 #${issueId} 스크린샷 원본 열기`}
    >
      <span
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted",
          fill && "h-full",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshotUrl}
          alt={`이슈 #${issueId} 스크린샷`}
          className={cn("w-full object-contain", fill ? "max-h-full" : maxHeightClass)}
        />
      </span>
      <span className="pointer-events-none absolute right-0 top-0 z-20 hidden w-[48rem] rounded-lg border border-border bg-surface p-2 shadow-lg group-focus-visible:block md:group-hover:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshotUrl}
          alt=""
          aria-hidden
          className="max-h-[48rem] w-full rounded-md object-contain"
        />
      </span>
    </a>
  );
}
