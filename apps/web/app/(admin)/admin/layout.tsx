import type { Metadata } from "next";
import { AdminNav } from "@/features/analytics/components/admin-nav";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "운영 지표",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/admin", label: "개요" },
  { href: "/admin/users", label: "회원" },
  { href: "/admin/orgs", label: "팀" },
  { href: "/admin/projects", label: "프로젝트" },
  { href: "/admin/issues", label: "이슈" },
  { href: "/admin/subscribers", label: "알림 신청" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-surface-subtle">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <AdminNav items={NAV_ITEMS} />
          <span className="truncate text-xs text-subtle">{admin.email}</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
