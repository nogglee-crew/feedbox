import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/orgs";

export const dynamic = "force-dynamic";

export default async function ProjectsRedirectPage() {
  const ctx = await requireOrg();
  redirect(`/${ctx.org.slug}/projects`);
}
