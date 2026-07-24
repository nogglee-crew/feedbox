import type { Issue } from "@/lib/types";

/** UA 문자열을 "Chrome 126 · macOS" 같은 요약으로 변환한다 */
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

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">
      {children}
    </span>
  );
}

/** 이슈의 수집 정보(URL/요소/환경)를 라벨-값 그리드로 표시한다 */
export function IssueMeta({ issue }: { issue: Issue }) {
  const browser = formatBrowser(issue.browser);
  return (
    <dl className="mt-3 grid grid-cols-[max-content_1fr] items-baseline gap-x-3 gap-y-1.5 text-xs">
      <dt className="font-semibold text-gray-400">URL</dt>
      <dd className="truncate text-gray-600">
        <a href={issue.page_url} target="_blank" rel="noreferrer" className="hover:underline">
          {issue.page_url}
        </a>
      </dd>

      <dt className="font-semibold text-gray-400">요소</dt>
      <dd className="truncate">
        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">{issue.selector}</code>
      </dd>

      {issue.element_text && (
        <>
          <dt className="font-semibold text-gray-400">텍스트</dt>
          <dd className="truncate text-gray-600">“{issue.element_text}”</dd>
        </>
      )}

      <dt className="font-semibold text-gray-400">환경</dt>
      <dd className="flex flex-wrap gap-1.5">
        {issue.viewport_width && issue.viewport_height && (
          <Tag>
            {issue.viewport_width}×{issue.viewport_height}
          </Tag>
        )}
        {browser && <Tag>{browser}</Tag>}
      </dd>
    </dl>
  );
}
