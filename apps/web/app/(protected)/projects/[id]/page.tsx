import Link from "next/link";
import { notFound } from "next/navigation";
import { createRelease, deleteProject, setReleaseStatus, updateProjectBaseUrl } from "@/app/actions";
import { CopyButton } from "@/components/copy-button";
import { requireOrg } from "@/lib/orgs";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ctx = await requireOrg();
  const [project, releases] = await Promise.all([store.getProject(id), store.listReleases(id)]);
  if (!project || (ctx && project.org_id !== ctx.org.id)) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-400">
            <Link href="/projects" className="hover:text-gray-600">프로젝트</Link> /
          </div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        <form action={deleteProject}>
          <input type="hidden" name="id" value={project.id} />
          <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
            프로젝트 삭제
          </button>
        </form>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-bold text-gray-700">SDK 설치 정보</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-24 text-xs font-semibold text-gray-500">projectKey</span>
            <code className="rounded bg-gray-100 px-2 py-0.5">{project.project_key}</code>
            <CopyButton value={project.project_key} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-xs font-semibold text-gray-500">apiKey</span>
            <code className="rounded bg-gray-100 px-2 py-0.5">{project.api_key}</code>
            <CopyButton value={project.api_key} />
          </div>
        </div>
        <form action={updateProjectBaseUrl} className="mt-4 flex items-end gap-2">
          <input type="hidden" name="id" value={project.id} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">서비스 URL (QA 링크 생성용)</label>
            <input
              name="base_url"
              defaultValue={project.base_url ?? ""}
              placeholder="https://staging.company.com"
              className="w-80 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">저장</button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">릴리즈</h2>
        <form action={createRelease} className="flex items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <input type="hidden" name="project_id" value={project.id} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">버전</label>
            <input
              name="version"
              required
              placeholder="예: v1.0.5"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            릴리즈 생성
          </button>
        </form>

        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {(releases ?? []).map((r) => (
            <li key={r.id} className="flex items-center justify-between px-5 py-4">
              <Link href={`/projects/${project.id}/releases/${r.id}`} className="flex-1 hover:underline">
                <span className="font-semibold">{r.version}</span>
                <span
                  className={`ml-3 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    r.status === "OPEN" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {r.status}
                </span>
              </Link>
              <form action={setReleaseStatus}>
                <input type="hidden" name="release_id" value={r.id} />
                <input type="hidden" name="project_id" value={project.id} />
                <input type="hidden" name="status" value={r.status === "OPEN" ? "CLOSED" : "OPEN"} />
                <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50">
                  {r.status === "OPEN" ? "QA 종료" : "다시 열기"}
                </button>
              </form>
            </li>
          ))}
          {(!releases || releases.length === 0) && (
            <li className="px-5 py-10 text-center text-sm text-gray-400">릴리즈를 생성하면 QA를 시작할 수 있습니다.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
