import type { Metadata } from "next";

// 가짜 ERP 화면이라 검색에 노출되면 안 된다
export const metadata: Metadata = {
  title: "데모 서비스",
  description: "FEEDBOX SDK가 설치된 예시 웹 서비스입니다.",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
