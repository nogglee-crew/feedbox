import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ToastProvider } from "@/components/ui/toast";
import { DashboardHomeLink, ProfileMenu } from "@/features/account/components/profile-menu";
import { hasPaidAccess } from "@/features/billing/domain/entitlements";
import { getUser } from "@/lib/auth";
import { getFlashToast } from "@/lib/flash-toast";
import { loadOrgContext, loadOrgContextBySlug } from "@/lib/orgs";

// 대시보드 전체는 색인 대상이 아니다. 개별 페이지는 title만 덮어쓴다
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");

  const { orgSlug } = await params;
  const orgCtxRaw = orgSlug ? await loadOrgContextBySlug(orgSlug) : await loadOrgContext();
  const orgCtx = orgCtxRaw === "no-org" ? null : orgCtxRaw;
  const teams =
    orgCtx && orgCtx !== "not-member"
      ? orgCtx.memberships.map(({ org }) => ({
          name: org.name,
          slug: org.slug,
          paid: hasPaidAccess(org),
        }))
      : [];
  const flashToast = await getFlashToast();

  return (
    <ToastProvider initialToast={flashToast}>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <DashboardHomeLink teams={teams} />
          <ProfileMenu
            name={user.name}
            email={user.email}
            avatarUrl={user.avatarUrl}
            team={
              orgCtx && orgCtx !== "not-member"
                ? {
                    name: orgCtx.org.name,
                    slug: orgCtx.org.slug,
                    paid: hasPaidAccess(orgCtx.org),
                  }
                : null
            }
            teams={teams}
          />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
    </ToastProvider>
  );
}
