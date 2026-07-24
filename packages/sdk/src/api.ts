import type {
  CreatedIssue,
  FeedboxConfig,
  FeedboxSessionInfo,
  IssuePayload,
} from "./types";

function baseUrl(config: FeedboxConfig): string {
  return (config.apiBaseUrl ?? "").replace(/\/$/, "");
}

async function post<T>(config: FeedboxConfig, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl(config)}${path}`, {
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
