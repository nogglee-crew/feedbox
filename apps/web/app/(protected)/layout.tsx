import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileMenu } from "@/components/profile-menu";
import { hasPaidAccess } from "@/features/billing/domain/entitlements";
import { getUser } from "@/lib/auth";
import { loadOrgContext } from "@/lib/orgs";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const orgCtxRaw = await loadOrgContext();
  const orgCtx = orgCtxRaw === "no-org" ? null : orgCtxRaw;

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
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
                    role: orgCtx.role,
                  }
                : null
            }
          />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </>
  );
}
