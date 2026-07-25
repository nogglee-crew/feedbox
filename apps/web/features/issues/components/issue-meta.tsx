import { Code } from "@/components/ui/code";
import { cn } from "@/components/ui/cn";
import type { Issue } from "@/lib/types";

export function formatBrowser(ua: string | null): string | null {
  if (!ua) return null;
  const browser =
    /Edg\/([\d]+)/.exec(ua)?.[0].replace("Edg/", "Edge ") ??
    /Chrome\/([\d]+)/.exec(ua)?.[0].replace("Chrome/", "Chrome ") ??
    /Firefox\/([\d]+)/.exec(ua)?.[0].replace("Firefox/", "Firefox ") ??
    (/Safari\//.test(ua) ? `Safari ${/Version\/([\d]+)/.exec(ua)?.[1] ?? ""}`.trim() : null);
  const os = /Macintosh/.test(ua)
    ? "macOS"
    : /Windows/.test(ua)
      ? "Windows"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  const parts = [browser, os].filter(Boolean);
  return parts.length ? parts.join(" · ") : ua.slice(0, 40);
}

export function IssueMeta({ issue, className }: { issue: Issue; className?: string }) {
  const browser = formatBrowser(issue.browser);
  return (
    <dl className={cn("mt-3 grid grid-cols-[max-content_1fr] items-baseline gap-x-3 gap-y-1.5 text-xs", className)}>
      <dt className="font-semibold text-subtle">페이지 URL</dt>
      <dd className="truncate text-muted">
        <a href={issue.page_url} target="_blank" rel="noreferrer" className="hover:underline">
          {issue.page_url}
        </a>
      </dd>

      <dt className="font-semibold text-subtle">요소</dt>
      <dd className="truncate">
        <Code>{issue.selector}</Code>
      </dd>

      {issue.element_text && (
        <>
          <dt className="font-semibold text-subtle">요소 텍스트</dt>
          <dd className="truncate text-muted">“{issue.element_text}”</dd>
        </>
      )}

      {issue.error_name && (
        <>
          <dt className="font-semibold text-subtle">에러명</dt>
          <dd className="min-w-0 text-muted">
            <Code>{issue.error_name}</Code>
          </dd>
        </>
      )}

      {issue.error_code && (
        <>
          <dt className="font-semibold text-subtle">에러 코드</dt>
          <dd className="min-w-0 text-muted">
            <Code>{issue.error_code}</Code>
          </dd>
        </>
      )}

      {issue.error_message && (
        <>
          <dt className="font-semibold text-subtle">에러 메시지</dt>
          <dd className="min-w-0 break-words text-muted">{issue.error_message}</dd>
        </>
      )}

      {issue.error_stack && (
        <>
          <dt className="font-semibold text-subtle">스택</dt>
          <dd className="min-w-0">
            <details>
              <summary className="cursor-pointer text-muted hover:underline">스택 보기</summary>
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-md border border-border bg-surface-muted p-2 font-mono text-xs text-foreground">
                {issue.error_stack}
              </pre>
            </details>
          </dd>
        </>
      )}

      {issue.api_url && (
        <>
          <dt className="font-semibold text-subtle">호출 API</dt>
          <dd className="flex min-w-0 items-center gap-1.5 text-muted">
            {issue.api_method && <Code>{issue.api_method}</Code>}
            <a
              href={issue.api_url}
              target="_blank"
              rel="noreferrer"
              className="truncate hover:underline"
            >
              {issue.api_url}
            </a>
            {issue.api_status !== null && <Code>{issue.api_status}</Code>}
          </dd>
        </>
      )}

      <dt className="font-semibold text-subtle">환경</dt>
      <dd className="flex flex-wrap gap-1.5">
        {issue.viewport_width && issue.viewport_height && (
          <Code>
            {issue.viewport_width}×{issue.viewport_height}
          </Code>
        )}
        {browser && <Code>{browser}</Code>}
      </dd>
    </dl>
  );
}
