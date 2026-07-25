import { redirect } from "next/navigation";
import { createOrganization } from "@/app/org-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUser, isAuthEnabled } from "@/lib/auth";
import { loadOrgContext } from "@/lib/orgs";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getUser();
  if (!user) redirect(isAuthEnabled() ? "/login" : "/projects");
  const ctx = await loadOrgContext();
  if (ctx !== "no-org") redirect("/projects"); // 이미 조직이 있음

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-surface p-8">
        <div>
          <h1 className="text-xl font-bold">조직 만들기</h1>
          <p className="mt-1 text-sm text-muted">
            프로젝트는 조직 단위로 관리됩니다. 팀 이름을 입력해 시작하세요.
          </p>
        </div>
        <form action={createOrganization} className="space-y-3">
          <Input name="name" required aria-label="팀 이름" placeholder="예: 노글리 팀" className="w-full" />
          <Button type="submit" variant="primary" className="w-full">
            조직 생성
          </Button>
        </form>
        <p className="text-xs text-subtle">
          이미 팀이 있다면 owner에게 <b>{user.email}</b> 초대를 요청하세요.
        </p>
      </div>
    </div>
  );
}
