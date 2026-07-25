import { redirect } from "next/navigation";
import { LandingPage } from "@/features/landing/components/landing-page";
import { getUser, isAuthEnabled } from "@/lib/auth";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; login_error?: string }>;
}) {
  // 로그인 상태(또는 인증 미구성 로컬 환경)면 대시보드로 보낸다
  if (!isAuthEnabled()) redirect("/projects");
  const { denied, login_error: loginError } = await searchParams;
  const user = await getUser();
  if (user && !denied && !loginError) redirect("/projects");
  return <LandingPage />;
}
