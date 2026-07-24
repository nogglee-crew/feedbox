import Link from "next/link";
import { notFound } from "next/navigation";
import { createQaSession, revokeQaSession } from "@/app/actions";
import { CopyButton } from "@/components/copy-button";
import { AssigneeControl, IssueStatusSelect } from "@/components/issue-controls";
import { IssueMeta } from "@/components/issue-meta";
import { listOrgMembers, requireOrg } from "@/lib/orgs";
import { store } from "@/lib/store";
import { ISSUE_STATUSES, type IssueStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function qaUrl(baseUrl: string | null, token: string): string {
  const target = baseUrl?.replace(/#.*$/, "") ?? "";
  return `${target}#session=${encodeURIComponent(token)}`;
}

export default async function ReleasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; releaseId: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { id, releaseId } = await params;
  const { status: statusFilter, q } = await searchParams;

  const ctx = await requireOrg();
  const [project, release, memberEmails, issues, sessions] = await Promise.all([
    store.getProject(id),
    store.getRelease(releaseId),
    ctx ? listOrgMembers(ctx.org.id).then((members) => members.map((m) => m.email)) : Promise.resolve(null),
    store.listIssues(releaseId, {
      status: ISSUE_STATUSES.includes(statusFilter as IssueStatus)
        ? (statusFilter as IssueStatus)
        : undefined,
      q: q || undefined,
    }),
    store.listSessions(releaseId),
  ]);
  if (!project || !release || (ctx && project.org_id !== ctx.org.id)) notFound();

  const now = Date.now();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm text-gray-400">
          <Link href="/projects" className="hover:text-gray-600">프로젝트</Link> /{" "}
          <Link href={`/projects/${project.id}`} className="hover:text-gray-600">{project.name}</Link> /
        </div>
        <h1 className="text-2xl font-bold">
          {release.version}
          <span
            className={`ml-3 align-middle rounded-full px-2 py-0.5 text-xs font-semibold ${
              release.status === "OPEN" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {release.status}
          </span>
        </h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">QA 세션</h2>
        <form action={createQaSession} className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <input type="hidden" name="project_id" value={project.id} />
          <input type="hidden" name="release_id" value={release.id} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">발급 대상 (선택)</label>
            <input name="created_by" placeholder="예: 고객사 QA팀" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">유효기간 (일)</label>
            <input name="days" type="number" defaultValue={7} min={1} max={90} className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            QA URL 발급
          </button>
        </form>

        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {(sessions ?? []).map((s) => {
            const expired = new Date(s.expires_at).getTime() < now;
            const active = !s.revoked_at && !expired;
            const url = qaUrl(project.base_url, s.token);
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {s.revoked_at ? "종료됨" : expired ? "만료됨" : "활성"}
                </span>
                <code className="max-w-md flex-1 truncate rounded bg-gray-100 px-2 py-1 text-xs">{url}</code>
                <CopyButton value={url} label="QA URL 복사" />
                <a
                  href={`/board/${s.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                >
                  현황판
                </a>
                <CopyButton value={`/board/${s.token}`} label="현황판 URL 복사" relativeToOrigin />
                <span className="text-xs text-gray-400">
                  {s.created_by && `${s.created_by} · `}~{new Date(s.expires_at).toLocaleDateString("ko-KR")}
                </span>
                {active && (
                  <form action={revokeQaSession}>
                    <input type="hidden" name="session_id" value={s.id} />
                    <input type="hidden" name="project_id" value={project.id} />
                    <input type="hidden" name="release_id" value={release.id} />
                    <button className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                      종료
                    </button>
                  </form>
                )}
              </li>
            );
          })}
          {(!sessions || sessions.length === 0) && (
            <li className="px-5 py-8 text-center text-sm text-gray-400">QA URL을 발급해 테스터에게 전달하세요.</li>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">이슈 ({issues?.length ?? 0})</h2>
          <form className="flex items-center gap-2" method="get">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="메모/URL/selector 검색"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            <select name="status" defaultValue={statusFilter ?? ""} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
              <option value="">전체 상태</option>
              {ISSUE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">필터</button>
          </form>
        </div>

        <ul className="space-y-3">
          {(issues ?? []).map((issue) => (
            <li key={issue.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">#{issue.id}</span>
                    <span className="truncate text-xs text-gray-400">{new Date(issue.created_at).toLocaleString("ko-KR")}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{issue.memo}</p>
                  <IssueMeta issue={issue} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <IssueStatusSelect issueId={issue.id} status={issue.status} />
                  <AssigneeControl issueId={issue.id} assignee={issue.assignee} members={memberEmails} />
                </div>
              </div>
              {issue.screenshot_url && (
                <a href={issue.screenshot_url} target="_blank" rel="noreferrer" className="mt-4 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={issue.screenshot_url}
                    alt={`이슈 #${issue.id} 스크린샷`}
                    className="max-h-64 rounded-lg border border-gray-200 object-contain"
                  />
                </a>
              )}
            </li>
          ))}
          {(!issues || issues.length === 0) && (
            <li className="rounded-xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-400">
              아직 등록된 이슈가 없습니다.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
