import { HiChatBubbleOvalLeft } from "react-icons/hi2";
import { OPEN_CHAT_URL } from "@/components/site-footer";

/**
 * 랜딩 전용 카카오톡 문의 플로팅 버튼 — 흰 필 + 우측에 겹친 원형 배지.
 * 카카오 공식 브랜드 컬러(#FEE500/#191919)는 서드파티 자산 예외로,
 * 이 격리된 컴포넌트 안에서만 쓴다 (DESIGN.md).
 */
export function KakaoInquiryButton() {
  return (
    <a
      href={OPEN_CHAT_URL}
      target="_blank"
      rel="noreferrer"
      className="heartbeat-calm group fixed bottom-5 right-5 z-50 flex items-center transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
    >
      <span
        className="rounded-full bg-surface py-3.5 pl-6 pr-12 text-sm font-bold text-foreground"
        style={{ boxShadow: "0 0 14px rgba(0, 0, 0, 0.14)" }}
      >
        개발자에게 연락하기
      </span>
      <span
        className="-ml-9 flex size-14 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: "#FEE500", boxShadow: "0 0 14px rgba(0, 0, 0, 0.14)" }}
      >
        <HiChatBubbleOvalLeft aria-hidden className="size-7" style={{ color: "#191919" }} />
      </span>
    </a>
  );
}
