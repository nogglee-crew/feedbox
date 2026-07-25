import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/orgs";

export default async function ProjectRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, ctx] = await Promise.all([params, requireOrg()]);
  redirect(`/${ctx.org.slug}/projects/${id}`);
}
