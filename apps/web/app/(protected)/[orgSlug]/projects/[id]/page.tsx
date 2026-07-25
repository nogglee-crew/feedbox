import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createRelease,
  setReleaseStatus,
  updateProjectBaseUrl,
} from "@/app/actions";
import { CopyButton } from "@/components/ui/copy-button";
import { StatusBadge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, cardClasses } from "@/components/ui/card";
import { Code } from "@/components/ui/code";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { DeleteProjectButton } from "@/features/projects/components/delete-project-button";
import { requireOrgBySlug } from "@/lib/orgs";
import { getProject, listReleases } from "@/features/projects/server/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  return { title: project?.name ?? "프로젝트" };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ orgSlug: string; id: string }>;
}) {
  const { orgSlug, id } = await params;

  const ctx = await requireOrgBySlug(orgSlug);
  const [project, releases] = await Promise.all([
    getProject(id),
    listReleases(id),
  ]);
  if (!project || (ctx && project.org_id !== ctx.org.id)) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-subtle">
            <Link
              href={`/${ctx.org.slug}/projects`}
              className="hover:text-muted"
            >
              프로젝트
            </Link>{" "}
            /
          </div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        <DeleteProjectButton
          orgSlug={ctx.org.slug}
          projectId={project.id}
          projectName={project.name}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="none">
          <h2 className="border-b border-border px-5 py-3 text-sm font-bold">
            SDK 설치 정보
          </h2>
          <dl className="divide-y divide-border-subtle text-sm">
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <dt className="text-xs font-semibold text-muted">projectKey</dt>
              <dd className="flex min-w-0 items-center gap-1.5">
                <Code className="truncate">{project.project_key}</Code>
                <CopyButton value={project.project_key} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <dt className="text-xs font-semibold text-muted">apiKey</dt>
              <dd className="flex min-w-0 items-center gap-1.5">
                {/* Limit accidental exposure while preserving full-value copy. */}
                <Code className="truncate">
                  {project.api_key.slice(0, 3)}
                  {"•".repeat(12)}
                </Code>
                <CopyButton value={project.api_key} />
              </dd>
            </div>
          </dl>
        </Card>

        <Card padding="none">
          <h2 className="border-b border-border px-5 py-3 text-sm font-bold">
            서비스 URL
          </h2>
          <div className="space-y-3 px-5 py-3">
            <p className="text-xs text-muted">
              QA URL을 만들 때 이 주소 뒤에 세션 토큰을 붙입니다.
            </p>
            <form
              action={updateProjectBaseUrl}
              className="flex items-center gap-2"
            >
              <input type="hidden" name="org_slug" value={ctx.org.slug} />
              <input type="hidden" name="id" value={project.id} />
              <Input
                id="project-base-url"
                name="base_url"
                aria-label="서비스 URL"
                defaultValue={project.base_url ?? ""}
                placeholder="https://staging.company.com"
                className="min-w-0 flex-1"
              />
              <SubmitButton variant="secondary" pendingText="저장 중...">
                저장
              </SubmitButton>
            </form>
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">릴리즈</h2>
        <form
          action={createRelease}
          className={`${cardClasses("sm")} flex items-end gap-3`}
        >
          <input type="hidden" name="org_slug" value={ctx.org.slug} />
          <input type="hidden" name="project_id" value={project.id} />
          <Input
            label="버전"
            name="version"
            required
            placeholder="예: v1.0.5"
          />
          <SubmitButton pendingText="생성 중...">릴리즈 생성</SubmitButton>
        </form>

        <ul className={`${cardClasses("none")} divide-y divide-border`}>
          {(releases ?? []).map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <Link
                href={`/${ctx.org.slug}/projects/${project.id}/releases/${r.id}`}
                className="flex flex-1 items-center gap-3 hover:underline"
              >
                <span className="font-semibold">{r.version}</span>
                <StatusBadge tone={r.status === "OPEN" ? "success" : "neutral"}>
                  {r.status}
                </StatusBadge>
              </Link>
              <form action={setReleaseStatus}>
                <input type="hidden" name="release_id" value={r.id} />
                <input type="hidden" name="org_slug" value={ctx.org.slug} />
                <input type="hidden" name="project_id" value={project.id} />
                <input
                  type="hidden"
                  name="status"
                  value={r.status === "OPEN" ? "CLOSED" : "OPEN"}
                />
                <SubmitButton variant="secondary" size="sm">
                  {r.status === "OPEN" ? "QA 종료" : "다시 열기"}
                </SubmitButton>
              </form>
            </li>
          ))}
          {(!releases || releases.length === 0) && (
            <EmptyState>릴리즈를 생성하면 QA를 시작할 수 있습니다.</EmptyState>
          )}
        </ul>
      </section>
    </div>
  );
}
