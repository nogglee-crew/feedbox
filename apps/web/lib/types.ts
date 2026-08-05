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

/** 코멘트 작성자. 멤버는 프로필 스냅샷, 익명 테스터는 세션 내 첫 코멘트 순서로 매긴 라벨 */
export type IssueCommentAuthor =
  | { kind: "member"; name: string; avatar_url: string | null }
  | { kind: "tester"; label: string };

export interface IssueComment {
  id: number;
  issue_id: number;
  author: IssueCommentAuthor;
  body: string;
  created_at: string;
  /** 요청자 본인 코멘트 여부. 수정은 본인만 가능하다 */
  mine: boolean;
  /** 삭제 가능 여부 — 본인이거나 조직 멤버(관리자)면 true */
  deletable: boolean;
}

/** 보드 카드의 접힌 상태 미리보기용 요약 */
export interface IssueCommentSummary {
  count: number;
  latest: IssueComment | null;
}

/** 보드 접속자. 조직 멤버로 로그인한 경우에만 값이 있고 입력창 아바타에 쓴다 */
export interface IssueCommentViewer {
  name: string;
  avatar_url: string | null;
}

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
