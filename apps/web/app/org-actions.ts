"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addOrganizationMember,
  createOrganizationForCurrentUser,
  deleteOrganization,
  findOrganizationForCurrentUser,
  isOrganizationSlugAvailable,
  removeOrganizationMember,
  renameOrganization,
  transferOwnership,
  updateOrganizationSlug,
} from "@/features/organizations/server/use-cases";
import { setFlashToast } from "@/lib/flash-toast";
import { normalizeOrgSlug } from "@/lib/org-slugs";

export async function createOrganization(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const org = await createOrganizationForCurrentUser(name);
  await setFlashToast("팀을 생성했습니다");
  redirect(`/${org.slug}/projects`);
}

export async function setActiveOrg(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  if (!orgId) return;
  const org = await findOrganizationForCurrentUser(orgId);
  if (!org) return;
  await setFlashToast("팀을 전환했습니다");
  redirect(`/${org.slug}/projects`);
}

export async function renameOrg(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!orgId || !name) return;
  await renameOrganization({ orgId, name });
  await setFlashToast("팀 이름을 저장했습니다");
  revalidatePath("/", "layout");
}

export async function checkOrgSlug(orgId: string, slug: string) {
  return isOrganizationSlugAvailable({ orgId, slug });
}

export async function updateOrgSlug(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  const currentSlug = String(formData.get("current_slug") ?? "");
  const slug = normalizeOrgSlug(String(formData.get("slug") ?? ""));
  if (!orgId || !slug) return;
  const org = await updateOrganizationSlug({ orgId, slug });
  await setFlashToast("팀 URL을 저장했습니다");
  revalidatePath("/", "layout");
  if (org.slug !== currentSlug) redirect(`/${org.slug}/settings/teams`);
}

export async function deleteOrg(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  const confirmName = String(formData.get("confirm_name") ?? "");
  if (!orgId) return;
  await deleteOrganization({ orgId, confirmName });
  await setFlashToast("팀을 삭제했습니다");
  // 삭제한 팀이 활성 팀일 수 있어 남은 팀을 다시 고르게 한다
  revalidatePath("/", "layout");
  redirect("/projects");
}

export async function addOrgMember(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "member") === "owner" ? "owner" : "member";
  if (!orgId || !email || !email.includes("@")) return;
  await addOrganizationMember({ orgId, email, role });
  await setFlashToast("멤버를 추가했습니다");
  revalidatePath("/", "layout");
}

export async function transferOwnershipAction(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  const orgSlug = String(formData.get("org_slug") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!orgId || !email || !email.includes("@")) return;
  await transferOwnership({ orgId, email });
  await setFlashToast("소유권을 이전했습니다. 회원님은 이제 member입니다.");
  revalidatePath("/", "layout");
  // 요청자는 이제 member라 멤버 관리 권한이 없으므로 팀 관리 페이지로 보낸다
  redirect(orgSlug ? `/${orgSlug}/settings/teams` : "/projects");
}

export async function removeOrgMember(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  const memberId = String(formData.get("member_id") ?? "");
  if (!orgId || !memberId) return;
  await removeOrganizationMember({ orgId, memberId });
  await setFlashToast("멤버를 삭제했습니다");
  revalidatePath("/", "layout");
}
