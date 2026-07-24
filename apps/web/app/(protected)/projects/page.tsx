import Link from "next/link";
import { createProject } from "@/app/actions";
import { SubscribeUpsell } from "@/components/subscribe-upsell";
import { projectLimit } from "@/features/billing/domain/entitlements";
import { hasSubscriptionInterest } from "@/features/billing/server/subscription-interest";
import { requireOrg } from "@/lib/orgs";
import { listProjectsForOrg } from "@/features/projects/server/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const ctx = await requireOrg();
  if (!ctx) throw new Error("Supabase Auth 환경변수가 필요합니다");
  const projects = await listProjectsForOrg(ctx.org.id);

  const limitReached = projects.length >= projectLimit(ctx.org);
  const subscribeRequested = limitReached
    ? await hasSubscriptionInterest(ctx.email)
    : false;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">프로젝트</h1>
        <p className="mt-1 text-sm text-gray-500">SDK를 설치할 웹 서비스 단위로 프로젝트를 만듭니다.</p>
      </div>

      {limitReached ? (
        <SubscribeUpsell email={ctx.email} orgId={ctx.org.id} requested={subscribeRequested} />
      ) : (
      <form action={createProject} className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">프로젝트 이름</label>
          <input
            name="name"
            required
            placeholder="예: ATOZ ERP"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">서비스 URL (QA 링크 생성용, 선택)</label>
          <input
            name="base_url"
            placeholder="https://staging.company.com"
            className="w-72 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          프로젝트 생성
        </button>
      </form>
      )}

      <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
        {(projects ?? []).map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="mt-0.5 text-xs text-gray-500">
                  key: <code>{p.project_key}</code>
                  {p.base_url && <> · {p.base_url}</>}
                </div>
              </div>
              <span className="text-sm text-gray-400">→</span>
            </Link>
          </li>
        ))}
        {(!projects || projects.length === 0) && (
          <li className="px-5 py-10 text-center text-sm text-gray-400">아직 프로젝트가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
