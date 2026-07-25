import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { OG_IMAGES, TWITTER_IMAGES } from "@/lib/site-metadata";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

// TODO: 배포 도메인 확정 시 NEXT_PUBLIC_SITE_URL 환경변수 설정
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // OAuth 동의 화면의 앱 이름("feedbox")과 첫 단어가 일치해야 구글 인증을 통과한다
  title: {
    default: "FEEDBOX 피드박스 | 웹 QA 피드백 플랫폼",
    template: "%s | FEEDBOX",
  },
  description:
    "FEEDBOX(피드박스)는 웹 서비스의 버그 제보를 수집하는 QA 피드백 플랫폼입니다. 사용자가 화면에서 문제가 된 요소를 찍고 메모를 남기면 셀렉터, 에러, API 호출, 브라우저 환경, 스크린샷이 자동으로 첨부됩니다.",
  keywords: ["QA", "버그 제보", "피드백 수집", "웹 피드백", "이슈 트래킹", "SDK"],
  icons: { icon: "/icon.png" },
  // 네이버 서치어드바이저 소유권 확인. 공개 값이라 환경변수로 감출 이유가 없다
  verification: {
    other: { "naver-site-verification": "3a6d6ba5687ce88c02fcb17b4d8544c187a6e642" },
  },
  openGraph: {
    type: "website",
    siteName: "FEEDBOX",
    title: "FEEDBOX 피드박스 | 웹 QA 피드백 플랫폼",
    description:
      "웹 서비스의 버그 제보를 수집하는 QA 피드백 플랫폼. 화면에서 문제가 된 요소를 찍고 메모만 남기면 재현 정보가 자동으로 첨부됩니다.",
    url: siteUrl,
    images: OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "FEEDBOX 피드박스 | 웹 QA 피드백 플랫폼",
    description:
      "웹 서비스의 버그 제보를 수집하는 QA 피드백 플랫폼. 화면에서 문제가 된 요소를 찍고 메모만 남기면 재현 정보가 자동으로 첨부됩니다.",
    images: TWITTER_IMAGES,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
