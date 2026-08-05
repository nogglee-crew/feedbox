import { redirect } from "next/navigation";
import { getChangelogUnread, loadChangelog } from "@/features/changelog/server/changelog";
import { LandingPage } from "@/features/landing/components/landing-page";
import { getUser, isAuthEnabled } from "@/lib/auth";

export default async function Home() {
  // 인증 미구성 로컬 환경만 대시보드로 보낸다.
  // 로그인 상태여도 랜딩은 항상 보이고, CTA가 대시보드 이동으로 바뀐다.
  if (!isAuthEnabled()) redirect("/projects");
  const [user, entries, changelogUnread] = await Promise.all([
    getUser(),
    loadChangelog(),
    getChangelogUnread(),
  ]);
  return (
    <LandingPage
      authenticated={Boolean(user)}
      latestChangelogDate={entries[0]?.date ?? null}
      changelogUnread={changelogUnread}
    />
  );
}
