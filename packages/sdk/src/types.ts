export interface FeedboxConfig {
  /** Dashboard에서 발급한 프로젝트 키 */
  projectKey: string;
  /** 프로젝트 API 키 */
  apiKey: string;
  /**
   * FEEDBOX API 베이스 URL (예: https://feedbox.example.com)
   * 생략 시 같은 origin 사용
   */
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
  /** PNG data URL (선택) */
  screenshot: string | null;
}

export interface CreatedIssue {
  id: number;
}
