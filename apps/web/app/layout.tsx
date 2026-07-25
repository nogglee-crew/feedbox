import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

// TODO: 배포 도메인 확정 시 NEXT_PUBLIC_SITE_URL 환경변수 설정
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "피드박스 | FEEDBOX",
    template: "%s | FEEDBOX",
  },
  description:
    "버그 제보를 받는 가장 짧은 경로 피드박스",
  keywords: ["QA", "버그 제보", "피드백 수집", "웹 피드백", "이슈 트래킹", "SDK"],
  icons: { icon: "/icon.png" },
  openGraph: {
    type: "website",
    siteName: "FEEDBOX",
    title: "피드박스 | FEEDBOX",
    description:
      "버그 제보를 받는 가장 짧은 경로 피드박스",
    url: siteUrl,
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "FEEDBOX" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "피드박스 | FEEDBOX",
    description:
      "버그 제보를 받는 가장 짧은 경로 피드박스",
    images: ["/opengraph-image.png"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
