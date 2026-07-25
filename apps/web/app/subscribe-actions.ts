"use server";

import { revalidatePath } from "next/cache";
import { requestSubscriptionInterest } from "@/features/billing/server/subscription-interest";
import { getUser } from "@/lib/auth";
import { requireOrg } from "@/lib/orgs";

export async function requestSubscriptionNotify(formData: FormData) {
  const agreed = formData.get("privacy_agree") === "on";
  if (!agreed) return;

  const user = await getUser();
  const email = (String(formData.get("email") ?? "").trim() || user?.email || "").toLowerCase();
  if (!email.includes("@")) return;
  const orgId = String(formData.get("org_id") ?? "");
  const ctx = await requireOrg();
  if (!ctx || !orgId || ctx.org.id !== orgId) return;

  await requestSubscriptionInterest({
    email,
    orgId,
  });
  revalidatePath("/projects");
}
