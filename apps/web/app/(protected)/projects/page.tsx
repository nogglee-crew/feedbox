import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/orgs";

export default async function ProjectsRedirectPage() {
  const ctx = await requireOrg();
  redirect(`/${ctx.org.slug}/projects`);
}
