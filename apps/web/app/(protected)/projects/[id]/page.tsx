import Link from "next/link";
import { notFound } from "next/navigation";
import { createRelease, deleteProject, setReleaseStatus, updateProjectBaseUrl } from "@/app/actions";
import { CopyButton } from "@/components/ui/copy-button";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, cardClasses } from "@/components/ui/card";
import { Code } from "@/components/ui/code";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { requireOrg } from "@/lib/orgs";
import { getProject, listReleases } from "@/features/projects/server/queries";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ctx = await requireOrg();
  const [project, releases] = await Promise.all([getProject(id), listReleases(id)]);
  if (!project || (ctx && project.org_id !== ctx.org.id)) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-subtle">
            <Link href="/projects" className="hover:text-muted">
              프로젝트
            </Link>{" "}
            /
          </div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        <form action={deleteProject}>
          <input type="hidden" name="id" value={project.id} />
          <Button type="submit" size="sm" variant="danger">
            프로젝트 삭제
          </Button>
        </form>
      </div>

      <Card>
        <h2 className="text-sm font-bold">SDK 설치 정보</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-24 text-xs font-semibold text-muted">projectKey</span>
            <Code>{project.project_key}</Code>
            <CopyButton value={project.project_key} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-xs font-semibold text-muted">apiKey</span>
            {/* 화면 공유/캡처 시 우발적 노출을 막기 위해 앞 3글자만 표시 (복사는 전체 값) */}
            <Code>
              {project.api_key.slice(0, 3)}
              {"•".repeat(12)}
            </Code>
            <CopyButton value={project.api_key} />
          </div>
        </div>
        <form action={updateProjectBaseUrl} className="mt-4 flex items-end gap-2">
          <input type="hidden" name="id" value={project.id} />
          <Input
            label="서비스 URL (QA 링크 생성용)"
            name="base_url"
            defaultValue={project.base_url ?? ""}
            placeholder="https://staging.company.com"
            className="w-80"
          />
          <Button type="submit">저장</Button>
        </form>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">릴리즈</h2>
        <form action={createRelease} className={`${cardClasses("sm")} flex items-end gap-3`}>
          <input type="hidden" name="project_id" value={project.id} />
          <Input label="버전" name="version" required placeholder="예: v1.0.5" />
          <Button type="submit" variant="primary">
            릴리즈 생성
          </Button>
        </form>

        <ul className={`${cardClasses("none")} divide-y divide-border`}>
          {(releases ?? []).map((r) => (
            <li key={r.id} className="flex items-center justify-between px-5 py-4">
              <Link
                href={`/projects/${project.id}/releases/${r.id}`}
                className="flex flex-1 items-center gap-3 hover:underline"
              >
                <span className="font-semibold">{r.version}</span>
                <StatusBadge tone={r.status === "OPEN" ? "success" : "neutral"}>{r.status}</StatusBadge>
              </Link>
              <form action={setReleaseStatus}>
                <input type="hidden" name="release_id" value={r.id} />
                <input type="hidden" name="project_id" value={project.id} />
                <input type="hidden" name="status" value={r.status === "OPEN" ? "CLOSED" : "OPEN"} />
                <Button type="submit" size="sm">
                  {r.status === "OPEN" ? "QA 종료" : "다시 열기"}
                </Button>
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
