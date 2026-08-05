import { OPEN_CHAT_URL } from "@/components/site-footer";

/**
 * 랜딩 전용 카카오톡 문의 플로팅 버튼.
 * 카카오 공식 브랜드 컬러(#FEE500)는 서드파티 자산 예외로,
 * 이 격리된 컴포넌트 안에서만 쓴다 (DESIGN.md).
 */
export function KakaoInquiryButton() {
  return (
    <a
      href={OPEN_CHAT_URL}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 rounded-full border-2 bg-surface px-4 py-2.5 text-sm font-bold text-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      style={{ borderColor: "#FEE500" }}
    >
      개발자에게 연락하기
    </a>
  );
}
