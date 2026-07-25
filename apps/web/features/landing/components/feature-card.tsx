import { Dot } from "@/components/ui/badge";

/** 카드 상단 비네트의 공통 무대 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="relative mb-4 flex h-16 items-center justify-center overflow-hidden rounded-lg bg-surface"
    >
      {children}
    </div>
  );
}

/** 요소를 조준하는 링 */
function AimVignette() {
  return (
    <Stage>
      <span className="relative">
        <span className="block rounded-md bg-primary px-3 py-1 text-[10px] font-semibold text-on-primary">
          가입하기
        </span>
        <span className="fx-ring absolute -inset-1 rounded-lg border-2 border-focus" />
      </span>
    </Stage>
  );
}

/** 진단 정보가 하나씩 붙는 모습 */
function DiagnosticsVignette() {
  return (
    <Stage>
      <span className="flex w-32 flex-col gap-1">
        <span className="fx-rise h-2 w-full rounded-full bg-surface-muted" />
        <span className="fx-rise fx-d1 h-2 w-3/4 rounded-full bg-surface-muted" />
        <span className="fx-rise fx-d2 h-2 w-1/2 rounded-full bg-danger-200" />
      </span>
    </Stage>
  );
}

/** 화면을 훑어 캡처하는 스캔 라인 */
function CaptureVignette() {
  return (
    <Stage>
      <span className="relative block h-10 w-16 overflow-hidden rounded border border-border bg-surface-subtle">
        <span className="fx-scan absolute inset-x-0 top-0 h-0.5 bg-focus" />
      </span>
    </Stage>
  );
}

/** 처리 현황이 차오르는 막대 */
function BoardVignette() {
  return (
    <Stage>
      <span className="flex w-32 flex-col gap-2">
        <span className="flex items-center gap-1.5">
          <Dot tone="danger" />
          <Dot tone="warning" />
          <Dot tone="success" />
          <Dot tone="neutral" />
        </span>
        <span className="block h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <span className="fx-grow block h-full rounded-full bg-success" />
        </span>
      </span>
    </Stage>
  );
}

/** 목록에서 선택이 옮겨 다니는 모습 */
function TriageVignette() {
  return (
    <Stage>
      <span className="relative block w-32">
        <span className="fx-shift absolute inset-x-0 top-0 h-6 rounded-md bg-surface-muted" />
        <span className="relative flex h-6 items-center gap-1.5 px-2">
          <Dot tone="danger" />
          <span className="h-1.5 w-14 rounded-full bg-border" />
        </span>
        <span className="relative flex h-6 items-center gap-1.5 px-2">
          <Dot tone="success" />
          <span className="h-1.5 w-10 rounded-full bg-border" />
        </span>
      </span>
    </Stage>
  );
}

/** JSON을 복사해 붙여넣는 순간 */
function ClipboardVignette() {
  return (
    <Stage>
      <span className="relative flex w-28 flex-col gap-1 rounded-md bg-surface-inverse p-2">
        <span className="h-1.5 w-full rounded-full bg-neutral-700" />
        <span className="h-1.5 w-3/4 rounded-full bg-neutral-700" />
        <span className="h-1.5 w-1/2 rounded-full bg-neutral-700" />
        <span className="fx-pop absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-success text-[9px] font-bold text-on-success">
          ✓
        </span>
      </span>
    </Stage>
  );
}

const VIGNETTES = {
  aim: AimVignette,
  diagnostics: DiagnosticsVignette,
  capture: CaptureVignette,
  board: BoardVignette,
  triage: TriageVignette,
  clipboard: ClipboardVignette,
} as const;

export type VignetteKey = keyof typeof VIGNETTES;

export function FeatureCard({
  vignette,
  title,
  body,
}: {
  vignette: VignetteKey;
  title: string;
  body: string;
}) {
  const Vignette = VIGNETTES[vignette];
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5">
      <Vignette />
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted">{body}</p>
    </div>
  );
}
