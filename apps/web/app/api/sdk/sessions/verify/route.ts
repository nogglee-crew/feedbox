import { authenticateSdk, corsJson, corsPreflight } from "@/lib/sdk-auth";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { context, error } = await authenticateSdk(body, { requireOpenRelease: false });
  if (error) return error;
  const { project, session, release } = context!;

  return corsJson({
    token: session.token,
    projectId: project.id,
    projectName: project.name,
    releaseId: release.id,
    releaseVersion: release.version,
    releaseStatus: release.status,
    expiresAt: session.expires_at,
  });
}
