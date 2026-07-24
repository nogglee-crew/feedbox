"use server";

import { revalidatePath } from "next/cache";
import {
  activateOrganizationForCurrentUser,
  addOrganizationMember,
  createOrganizationForCurrentUser,
  removeOrganizationMember,
} from "@/features/organizations/server/use-cases";

export async function createOrganization(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await createOrganizationForCurrentUser(name);
}

export async function setActiveOrg(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  if (!orgId) return;
  await activateOrganizationForCurrentUser(orgId);
}

export async function addOrgMember(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "member") === "owner" ? "owner" : "member";
  if (!orgId || !email || !email.includes("@")) return;
  await addOrganizationMember({ orgId, email, role });
  revalidatePath("/settings/members");
}

export async function removeOrgMember(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  const memberId = String(formData.get("member_id") ?? "");
  if (!orgId || !memberId) return;
  await removeOrganizationMember({ orgId, memberId });
  revalidatePath("/settings/members");
}
