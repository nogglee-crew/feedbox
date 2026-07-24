import type { Issue, IssueStatus, Project, QaSession, Release } from "../types";

export interface NewIssue {
  project_id: string;
  release_id: string;
  session_id: string | null;
  page_url: string;
  selector: string;
  element_text: string | null;
  viewport_width: number | null;
  viewport_height: number | null;
  browser: string | null;
  memo: string;
  screenshot_url: string | null;
}

export interface IssueFilter {
  status?: IssueStatus;
  q?: string;
}

export interface Store {
  /** orgId를 주면 해당 조직 소속 프로젝트만 반환 */
  listProjects(orgId?: string | null): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  getProjectByKey(projectKey: string): Promise<Project | null>;
  createProject(input: {
    name: string;
    project_key: string;
    base_url: string | null;
    org_id: string;
  }): Promise<void>;
  updateProject(id: string, patch: { base_url: string | null }): Promise<void>;
  deleteProject(id: string): Promise<void>;

  listReleases(projectId: string): Promise<Release[]>;
  getRelease(id: string): Promise<Release | null>;
  createRelease(projectId: string, version: string): Promise<void>;
  setReleaseStatus(id: string, status: "OPEN" | "CLOSED"): Promise<void>;

  listSessions(releaseId: string): Promise<QaSession[]>;
  getSessionByToken(token: string): Promise<QaSession | null>;
  createSession(input: {
    project_id: string;
    release_id: string;
    created_by: string | null;
    expires_at: string;
  }): Promise<void>;
  revokeSession(id: string): Promise<void>;

  listIssues(releaseId: string, filter: IssueFilter): Promise<Issue[]>;
  createIssue(input: NewIssue): Promise<{ id: number }>;
  updateIssue(id: number, patch: Partial<Pick<Issue, "status" | "assignee">>): Promise<void>;

  /** PNG 버퍼를 저장하고 접근 가능한 URL을 반환한다. 실패 시 null. */
  saveScreenshot(projectId: string, png: Buffer): Promise<string | null>;
}
