import { notFound } from "next/navigation";
import { IssueMeta } from "@/components/issue-meta";
import { store } from "@/lib/store";
import { ISSUE_STATUSES, type IssueStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<IssueStatus, string> = {
  OPEN: "접수됨",
  IN_PROGRESS: "처리 중",
  DONE: "처리 완료",
  CLOSED: "종료",
};

const STATUS_BADGE: Record<IssueStatus, string> = {
  OPEN: "bg-red-50 text-red-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  DONE: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

/**
 * 고객사 공유용 이슈 현황판 (로그인 불필요).
 * QA 세션 토큰으로 접근하며, 세션을 종료하면 링크도 무효화된다.
 * 만료된 세션도 조회는 가능 (QA 기간 이후 진행 상황 확인 용도).
 */
export default async function BoardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const session = await store.getSessionByToken(token);
  if (!session || session.revoked_at) notFound();

  const [project, release, issues] = await Promise.all([
    store.getProject(session.project_id),
    store.getRelease(session.release_id),
    store.listIssues(session.release_id, {}),
  ]);
  if (!project || !release) notFound();

  const counts = Object.fromEntries(
    ISSUE_STATUSES.map((s) => [s, issues.filter((i) => i.status === s).length]),
  ) as Record<IssueStatus, number>;
  const resolved = counts.DONE + counts.CLOSED;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gray-400">QA 이슈 현황</p>
        <h1 className="text-2xl font-bold">
          {project.name} <span className="text-gray-400">·</span> {release.version}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          전체 {issues.length}건 중 {resolved}건 처리 완료
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ISSUE_STATUSES.map((s) => (
          <div key={s} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs font-semibold text-gray-500">{STATUS_LABEL[s]}</div>
            <div className="mt-1 text-2xl font-bold">{counts[s]}</div>
          </div>
        ))}
      </div>

      <ul className="space-y-3">
        {issues.map((issue) => (
          <li key={issue.id} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">#{issue.id}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[issue.status]}`}
                  >
                    {STATUS_LABEL[issue.status]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(issue.created_at).toLocaleString("ko-KR")}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{issue.memo}</p>
                <IssueMeta issue={issue} />
              </div>
            </div>
            {issue.screenshot_url && (
              <a href={issue.screenshot_url} target="_blank" rel="noreferrer" className="mt-4 block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={issue.screenshot_url}
                  alt={`이슈 #${issue.id} 스크린샷`}
                  className="max-h-48 rounded-lg border border-gray-200 object-contain"
                />
              </a>
            )}
          </li>
        ))}
        {issues.length === 0 && (
          <li className="rounded-xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-400">
            아직 등록된 이슈가 없습니다.
          </li>
        )}
      </ul>

      <p className="text-center text-xs text-gray-400">
        이 페이지는 읽기 전용입니다 · QA 세션 만료: {new Date(session.expires_at).toLocaleDateString("ko-KR")}
      </p>
    </div>
  );
}
