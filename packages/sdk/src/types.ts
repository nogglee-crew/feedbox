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
  releaseStatus: "OPEN" | "CLOSED";
  expiresAt: string;
}

export interface IssueErrorContext {
  name: string;
  code: string;
  message: string;
  stack: string | null;
}

export interface IssueRequestContext {
  method: string;
  url: string;
  status: number | null;
}

export interface IssueDiagnostics {
  error: IssueErrorContext;
  request: IssueRequestContext | null;
}

export interface CaptureFeedboxErrorOptions {
  code?: string;
  request?: IssueRequestContext | null;
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
  diagnostics?: IssueDiagnostics | null;
}

export interface CreatedIssue {
  id: number;
}
