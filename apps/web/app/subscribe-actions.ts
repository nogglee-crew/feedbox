"use server";

import { revalidatePath } from "next/cache";
import { requestSubscriptionInterest } from "@/features/billing/server/subscription-interest";
import { getUser } from "@/lib/auth";
import { requireOrg } from "@/lib/orgs";

/** 구독 출시 알림 신청 — 개인정보 수집·이용 동의가 있어야만 저장한다 */
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
