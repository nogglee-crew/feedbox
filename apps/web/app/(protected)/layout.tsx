import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { OrgSwitcher } from "@/components/org-switcher";
import { loadOrgContext } from "@/lib/orgs";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const orgCtxRaw = await loadOrgContext();
  const orgCtx = orgCtxRaw === "no-org" ? null : orgCtxRaw;

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/projects" className="text-lg font-bold">
            FEEDBOX
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-500">
            {orgCtx && <OrgSwitcher orgs={orgCtx.orgs} activeId={orgCtx.org.id} />}
            <Link href="/projects" className="hover:text-gray-900">
              프로젝트
            </Link>
            {orgCtx && (
              <Link href="/settings/members" className="hover:text-gray-900">
                멤버
              </Link>
            )}
            {orgCtx && (
              <form action={signOut} className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{orgCtx.email}</span>
                <button className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100">
                  로그아웃
                </button>
              </form>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </>
  );
}
