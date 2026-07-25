import Link from "next/link";
import { redirect } from "next/navigation";
import { ToastProvider } from "@/components/ui/toast";
import { ProfileMenu } from "@/features/account/components/profile-menu";
import { hasPaidAccess } from "@/features/billing/domain/entitlements";
import { getUser } from "@/lib/auth";
import { getFlashToast } from "@/lib/flash-toast";
import { loadOrgContext } from "@/lib/orgs";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const orgCtxRaw = await loadOrgContext();
  const orgCtx = orgCtxRaw === "no-org" ? null : orgCtxRaw;
  const flashToast = await getFlashToast();

  return (
    <ToastProvider initialToast={flashToast}>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/projects" className="text-lg font-bold">
            FEEDBOX
          </Link>
          <ProfileMenu
            name={user.name}
            email={user.email}
            avatarUrl={user.avatarUrl}
            team={
              orgCtx
                ? {
                    name: orgCtx.org.name,
                    paid: hasPaidAccess(orgCtx.org),
                  }
                : null
            }
          />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </ToastProvider>
  );
}
