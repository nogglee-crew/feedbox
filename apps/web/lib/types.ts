export interface Organization {
  id: string;
  slug: string;
  name: string;
  created_at: string;
  plan: "FREE" | "PRO";
  billing_status: "UNPAID" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  access_override: "NONE" | "ADMIN" | "TEST";
}

export type OrgRole = "owner" | "member";

export interface OrgMemberProfile {
  email: string;
  name: string | null;
  avatar_url: string | null;
}

export interface OrgMember extends OrgMemberProfile {
  id: string;
  org_id: string;
  user_id: string | null;
  role: OrgRole;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  project_key: string;
  api_key: string;
  base_url: string | null;
  org_id: string;
  created_at: string;
}

export interface Release {
  id: string;
  project_id: string;
  version: string;
  status: "OPEN" | "CLOSED";
  created_at: string;
}

export interface QaSession {
  id: string;
  token: string;
  project_id: string;
  release_id: string;
  created_by: string | null;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}

export const ISSUE_STATUSES = ["OPEN", "IN_PROGRESS", "DONE", "CLOSED"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export interface Issue {
  id: number;
  /** 화면에 노출하는 프로젝트 단위 일련번호 */
  number: number;
  project_id: string;
  release_id: string;
  session_id: string | null;
  page_url: string;
  selector: string;
  element_text: string | null;
  viewport_width: number | null;
  viewport_height: number | null;
  browser: string | null;
  error_name: string | null;
  error_code: string | null;
  error_message: string | null;
  error_stack: string | null;
  api_method: string | null;
  api_url: string | null;
  api_status: number | null;
  memo: string;
  screenshot_url: string | null;
  status: IssueStatus;
  assignee: string | null;
  created_at: string;
}
