import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/orgs";

export default async function ReleaseRedirectPage({
  params,
}: {
  params: Promise<{ id: string; releaseId: string }>;
}) {
  const [{ id, releaseId }, ctx] = await Promise.all([params, requireOrg()]);
  redirect(`/${ctx.org.slug}/projects/${id}/releases/${releaseId}`);
}
