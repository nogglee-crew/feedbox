"use client";

import { useEffect, useState } from "react";
import { HiCheck } from "react-icons/hi2";
import { cn } from "@/components/ui/cn";

const MEMO = "가입 버튼을 눌러도 반응이 없어요";

// 요소 조준 → 하이라이트 → 패널 → 메모 입력 → 등록 완료를 반복한다
const SEQUENCE = [
  ["rest", 900],
  ["aim", 1000],
  ["focus", 750],
  ["panel", 550],
  ["typing", 2100],
  ["done", 2600],
] as const;

type Stage = (typeof SEQUENCE)[number][0];

/** 히어로 장식용 커서. 인터페이스 아이콘이 아니라 애니메이션 소품이라 직접 그린다 */
function CursorGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="drop-shadow">
      <path d="M5 3l14 8-6.5 1.5L9 19z" strokeWidth="1.5" className="fill-foreground stroke-surface" />
    </svg>
  );
}

export function HeroDemo() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const [, ms] = SEQUENCE[index];
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % SEQUENCE.length), ms);
    return () => window.clearTimeout(timer);
  }, [index, reduced]);

  const stage: Stage = reduced ? "done" : SEQUENCE[index][0];

  useEffect(() => {
    if (reduced) {
      setTyped(MEMO);
      return;
    }
    if (stage === "rest") setTyped("");
    if (stage !== "typing") return;
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setTyped(MEMO.slice(0, count));
      if (count >= MEMO.length) window.clearInterval(timer);
    }, 85);
    return () => window.clearInterval(timer);
  }, [stage, reduced]);

  const focused = stage !== "rest" && stage !== "aim";
  const panelOpen = stage === "panel" || stage === "typing" || stage === "done";
  const done = stage === "done";

  return (
    <div className="relative">
      <p className="sr-only">
        피드백 모드 시연: 화면에서 버튼을 선택하면 하이라이트되고, 메모를 입력해 이슈로 등록됩니다.
      </p>

      <div aria-hidden className="relative mx-auto h-80 w-full max-w-lg select-none">
        {/* 고객 서비스 화면 역할의 미니 폼 */}
        <div className="absolute left-0 top-8 w-64 rounded-xl border border-border bg-surface p-4">
          <div className="flex gap-1.5">
            {/* 신호등 점은 장식이라 시맨틱 토큰 대신 프리미티브를 쓴다 */}
            <span className="size-2 rounded-full bg-danger-400" />
            <span className="size-2 rounded-full bg-warning-500" />
            <span className="size-2 rounded-full bg-success-500" />
          </div>
          <p className="mt-3 text-sm font-semibold">회원 가입</p>
          <div className="mt-2 h-8 rounded-md border border-border bg-surface-subtle" />
          <div className="mt-2 h-8 rounded-md border border-border bg-surface-subtle" />
          <span className="relative mt-3 inline-block">
            <span className="inline-flex rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary">
              가입하기
            </span>
            <span
              className={cn(
                "pointer-events-none absolute -inset-1.5 rounded-lg border-2 border-focus bg-focus/10 transition-opacity duration-300",
                focused ? "opacity-100" : "opacity-0",
              )}
            />
          </span>
        </div>

        {/* 커서 */}
        <span
          className="absolute z-10 transition-all duration-700 ease-out"
          style={stage === "rest" ? { top: "12%", left: "6%" } : { top: "55%", left: "21%" }}
        >
          <CursorGlyph />
        </span>

        {/* 피드백 등록 패널 */}
        <div
          className={cn(
            "absolute right-0 top-0 w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-lg transition-all duration-300",
            panelOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
          )}
        >
          <div className="bg-surface-inverse px-3 py-2 text-xs font-bold text-on-inverse">
            피드백 등록 · v1.0.5
          </div>
          <div className="space-y-2 p-3">
            <p className="text-xs font-semibold text-muted">선택한 요소</p>
            <code className="block truncate rounded bg-surface-muted px-2 py-1 font-mono text-xs">
              main &gt; form &gt; button
            </code>
            <div className="min-h-16 rounded-md border border-border-strong p-2 text-xs">
              {typed.length > 0 ? typed : <span className="text-subtle">어떤 문제가 있나요?</span>}
              {stage === "typing" && (
                <span className="ml-px inline-block h-3 w-px animate-pulse bg-foreground align-middle" />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <span className="rounded-md border border-border px-2.5 py-1 text-xs text-muted">
                취소
              </span>
              <span
                className={cn(
                  "rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-on-primary transition-opacity duration-300",
                  typed.length === MEMO.length ? "opacity-100" : "opacity-50",
                )}
              >
                이슈 등록
              </span>
            </div>
          </div>
        </div>

        {/* 등록 완료 토스트 */}
        <div
          className={cn(
            "absolute bottom-10 right-0 flex items-center gap-1.5 rounded-xl bg-surface-inverse px-3 py-2 text-xs text-on-inverse shadow-lg transition-all duration-300",
            done ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          )}
        >
          <HiCheck aria-hidden className="size-3.5" />
          이슈가 등록되었습니다 · #14
        </div>
      </div>
    </div>
  );
}
