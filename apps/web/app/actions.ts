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
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const baseUrl = String(formData.get("base_url") ?? "").trim() || null;
  await createProjectForCurrentOrg({ name, baseUrl });
  await setFlashToast("프로젝트를 생성했습니다");
  revalidatePath("/projects");
}

export async function deleteProject(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteProjectForCurrentOrg(id);
  await setFlashToast("프로젝트를 삭제했습니다");
  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProjectBaseUrl(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const baseUrl = String(formData.get("base_url") ?? "").trim() || null;
  if (!id) return;
  await updateProjectBaseUrlForCurrentOrg(id, baseUrl);
  await setFlashToast("서비스 URL을 저장했습니다");
  revalidatePath(`/projects/${id}`);
}

export async function createRelease(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "");
  const version = String(formData.get("version") ?? "").trim();
  if (!projectId || !version) return;
  await createReleaseForCurrentOrg(projectId, version);
  await setFlashToast("릴리즈를 생성했습니다");
  revalidatePath(`/projects/${projectId}`);
}

export async function setReleaseStatus(formData: FormData) {
  const releaseId = String(formData.get("release_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!releaseId || (status !== "OPEN" && status !== "CLOSED")) return;
  await setReleaseStatusForCurrentOrg({ projectId, releaseId, status });
  await setFlashToast(status === "OPEN" ? "릴리즈를 다시 열었습니다" : "QA를 종료했습니다");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/releases/${releaseId}`);
}

export async function createQaSession(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "");
  const releaseId = String(formData.get("release_id") ?? "");
  const createdBy = String(formData.get("created_by") ?? "").trim() || null;
  const days = Number(formData.get("days") ?? 7) || 7;
  if (!projectId || !releaseId) return;
  await createSessionForCurrentOrg({
    projectId,
    releaseId,
    createdBy,
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  });
  await setFlashToast("QA URL을 발급했습니다");
  revalidatePath(`/projects/${projectId}/releases/${releaseId}`);
}

export async function revokeQaSession(formData: FormData) {
  const sessionId = String(formData.get("session_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const releaseId = String(formData.get("release_id") ?? "");
  if (!sessionId) return;
  await revokeSessionForCurrentOrg({ projectId, releaseId, sessionId });
  await setFlashToast("QA 세션을 종료했습니다");
  revalidatePath(`/projects/${projectId}/releases/${releaseId}`);
}

export async function updateIssueStatus(issueId: number, status: string) {
  await updateIssueForCurrentOrg(issueId, { status });
  revalidatePath("/", "layout");
}

export async function updateIssueAssignee(issueId: number, assignee: string) {
  await updateIssueForCurrentOrg(issueId, { assignee: assignee.trim() || null });
  revalidatePath("/", "layout");
}
