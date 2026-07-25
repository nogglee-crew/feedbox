import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/orgs";

export default async function MembersRedirectPage() {
  const ctx = await requireOrg();
  redirect(`/${ctx.org.slug}/settings/members`);
}
