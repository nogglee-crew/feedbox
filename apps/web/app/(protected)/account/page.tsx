import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { updateUsername } from "@/app/account-actions";
import { Avatar } from "@/components/ui/avatar";
import { cardClasses } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { DeleteAccountSection } from "@/features/account/components/delete-account-section";
import { getUser } from "@/lib/auth";
import { loadOrgContext } from "@/lib/orgs";

export const metadata: Metadata = { title: "계정 설정" };

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");

  const ctx = await loadOrgContext();
  const displayName = ctx === "no-org" ? (user.name ?? user.email) : ctx.displayName;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">계정 설정</h1>

      <section className={cardClasses()}>
        <div className="flex items-center gap-3">
          <Avatar name={displayName} src={user.avatarUrl} size="lg" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{displayName}</div>
            <div className="truncate text-xs text-muted">{user.email}</div>
          </div>
        </div>
        <form action={updateUsername} className="mt-6 space-y-4">
          <Input label="닉네임" name="username" defaultValue={displayName} maxLength={50} />
          <div className="flex justify-end">
            <SubmitButton spinner={false} pendingText="저장 중...">
              저장
            </SubmitButton>
          </div>
        </form>
      </section>

      <DeleteAccountSection />
    </div>
  );
}
