"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProjectForCurrentOrg,
  createReleaseForCurrentOrg,
  createSessionForCurrentOrg,
  deleteProjectForCurrentOrg,
  revokeSessionForCurrentOrg,
  setReleaseStatusForCurrentOrg,
  updateIssueForCurrentOrg,
  updateProjectBaseUrlForCurrentOrg,
} from "@/features/projects/server/use-cases";
import { setFlashToast } from "@/lib/flash-toast";

export async function createProject(formData: FormData) {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!orgSlug || !name) return;
  const baseUrl = String(formData.get("base_url") ?? "").trim() || null;
  await createProjectForCurrentOrg({ orgSlug, name, baseUrl });
  await setFlashToast("프로젝트를 생성했습니다", "success", "project_create");
  revalidatePath(`/${orgSlug}/projects`);
}

export async function deleteProject(formData: FormData) {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const id = String(formData.get("id") ?? "");
  const confirmName = String(formData.get("confirm_name") ?? "");
  if (!orgSlug || !id) return;
  await deleteProjectForCurrentOrg(orgSlug, id, confirmName);
  await setFlashToast("프로젝트를 삭제했습니다");
  revalidatePath(`/${orgSlug}/projects`);
  redirect(`/${orgSlug}/projects`);
}

export async function updateProjectBaseUrl(formData: FormData) {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const id = String(formData.get("id") ?? "");
  const baseUrl = String(formData.get("base_url") ?? "").trim() || null;
  if (!orgSlug || !id) return;
  await updateProjectBaseUrlForCurrentOrg(orgSlug, id, baseUrl);
  await setFlashToast("서비스 URL을 저장했습니다");
  revalidatePath(`/${orgSlug}/projects/${id}`);
}

export async function createRelease(formData: FormData) {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const version = String(formData.get("version") ?? "").trim();
  if (!orgSlug || !projectId || !version) return;
  await createReleaseForCurrentOrg(orgSlug, projectId, version);
  await setFlashToast("릴리즈를 생성했습니다", "success", "release_create");
  revalidatePath(`/${orgSlug}/projects/${projectId}`);
}

export async function setReleaseStatus(formData: FormData) {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const releaseId = String(formData.get("release_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!orgSlug || !releaseId || (status !== "OPEN" && status !== "CLOSED")) return;
  await setReleaseStatusForCurrentOrg({ orgSlug, projectId, releaseId, status });
  await setFlashToast(status === "OPEN" ? "릴리즈를 다시 열었습니다" : "QA를 종료했습니다");
  revalidatePath(`/${orgSlug}/projects/${projectId}`);
  revalidatePath(`/${orgSlug}/projects/${projectId}/releases/${releaseId}`);
}

export async function createQaSession(formData: FormData) {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const releaseId = String(formData.get("release_id") ?? "");
  const createdBy = String(formData.get("created_by") ?? "").trim() || null;
  const days = Number(formData.get("days") ?? 7) || 7;
  if (!orgSlug || !projectId || !releaseId) return;
  await createSessionForCurrentOrg({
    orgSlug,
    projectId,
    releaseId,
    createdBy,
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  });
  await setFlashToast("QA URL을 발급했습니다", "success", "qa_session_create");
  revalidatePath(`/${orgSlug}/projects/${projectId}/releases/${releaseId}`);
}

export async function revokeQaSession(formData: FormData) {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const sessionId = String(formData.get("session_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const releaseId = String(formData.get("release_id") ?? "");
  if (!orgSlug || !sessionId) return;
  await revokeSessionForCurrentOrg({ orgSlug, projectId, releaseId, sessionId });
  await setFlashToast("QA 세션을 종료했습니다");
  revalidatePath(`/${orgSlug}/projects/${projectId}/releases/${releaseId}`);
}

export async function updateIssueStatus(orgSlug: string, issueId: number, status: string) {
  await updateIssueForCurrentOrg(orgSlug, issueId, { status });
  revalidatePath("/", "layout");
}

export async function updateIssueAssignee(orgSlug: string, issueId: number, assignee: string) {
  await updateIssueForCurrentOrg(orgSlug, issueId, { assignee: assignee.trim() || null });
  revalidatePath("/", "layout");
}
