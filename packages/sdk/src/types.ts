export interface FeedboxConfig {
  projectKey: string;
  apiKey: string;
  /** Defaults to the host application's origin. */
  apiBaseUrl?: string;
}

export interface FeedboxSessionInfo {
  token: string;
  projectId: string;
  projectName: string;
  releaseId: string;
  releaseVersion: string;
  expiresAt: string;
}

export interface IssuePayload {
  pageUrl: string;
  selector: string;
  elementText: string | null;
  viewportWidth: number;
  viewportHeight: number;
  browser: string;
  memo: string;
  screenshot: string | null;
}

export interface CreatedIssue {
  id: number;
}
