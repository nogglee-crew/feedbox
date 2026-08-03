import type {
  CreatedIssue,
  FeedboxConfig,
  FeedboxSessionInfo,
  IssuePayload,
} from "./types";
import { untrackedFetch } from "./diagnostics";

/** 셀프 호스팅이 아니면 항상 같은 값이라 기본값으로 둔다 */
const DEFAULT_API_BASE_URL = "https://feedbox.nogglee.com";

export function baseUrl(config: FeedboxConfig): string {
  return (config.apiBaseUrl ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

async function post<T>(config: FeedboxConfig, path: string, body: unknown): Promise<T> {
  const res = await untrackedFetch(`${baseUrl(config)}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectKey: config.projectKey,
      apiKey: config.apiKey,
      ...(body as Record<string, unknown>),
    }),
  });
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) {
    throw new Error(data?.error ?? `FEEDBOX API error (${res.status})`);
  }
  return data as T;
}

export function verifySession(
  config: FeedboxConfig,
  token: string,
): Promise<FeedboxSessionInfo> {
  return post<FeedboxSessionInfo>(config, "/api/sdk/sessions/verify", { token });
}

export function createIssue(
  config: FeedboxConfig,
  token: string,
  payload: IssuePayload,
): Promise<CreatedIssue> {
  return post<CreatedIssue>(config, "/api/sdk/issues", { token, ...payload });
}
