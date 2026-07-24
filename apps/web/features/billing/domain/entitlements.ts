import type { Organization } from "@/lib/types";

export const FREE_PROJECT_LIMIT = 1;

export function hasPaidAccess(
  org: Pick<Organization, "plan" | "billing_status" | "access_override">,
): boolean {
  return (
    org.access_override === "ADMIN" ||
    org.access_override === "TEST" ||
    (org.plan === "PRO" &&
      (org.billing_status === "TRIALING" || org.billing_status === "ACTIVE"))
  );
}

export function projectLimit(
  org: Pick<Organization, "plan" | "billing_status" | "access_override">,
): number {
  return hasPaidAccess(org) ? Number.POSITIVE_INFINITY : FREE_PROJECT_LIMIT;
}
