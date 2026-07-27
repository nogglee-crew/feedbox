import Link from "next/link";
import { Fragment } from "react";
import { HiArrowDown, HiArrowRight } from "react-icons/hi2";
import { cardClasses } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";

/** href를 주면 상세 목록으로 들어가는 링크가 된다. */
export function StatTile({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="flex items-center gap-1 text-xs text-muted">
        {label}
        {href ? (
          <HiArrowRight
            aria-hidden
            className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
          />
        ) : null}
      </p>
      <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-subtle">{hint}</p> : null}
    </>
  );

  if (!href) return <div className={cardClasses("sm")}>{body}</div>;

  return (
    <Link
      href={href}
      className={cn(
        cardClasses("sm"),
        "group block transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle",
      )}
    >
      {body}
    </Link>
  );
}

export interface FunnelStep {
  label: string;
  count: number;
  description?: string;
  /** 직전 단계를 통과한 사람이 이 단계에 도달하기까지 걸린 기간(일) 중앙값 */
  medianDaysFromPrevious?: number | null;
  /** 이 단계에서 다음 단계로 가는 구간을 해석하는 데 필요한 보조 지표 */
  transitionNote?: string;
}

function formatDays(days: number): string {
  if (days < 1 / 24) return "1시간 이내";
  if (days < 1) return `${Math.round(days * 24)}시간`;
  return `${days.toFixed(days < 10 ? 1 : 0)}일`;
}

/**
 * 활성화 퍼널.
 * 단계별 절대 수치는 위 타일에 이미 있으므로, 이 화면은 단계 사이의 전환만 보여준다.
 * 아직 다음 단계에 도달하지 않았을 뿐 떠난 것은 아니므로 '이탈'이 아니라 '미도달'로 적는다.
 */
export function FunnelSteps({ steps }: { steps: FunnelStep[] }) {
  const drops = steps.map((step, index) =>
    index === 0 ? 0 : Math.max(0, steps[index - 1].count - step.count),
  );
  const notes = steps
    .map((step, index) => ({ step, next: steps[index + 1] }))
    .filter((entry) => entry.step.transitionNote && entry.next);

  return (
    <div className="flex flex-col gap-3">
      {/* 좁은 화면에서는 세로로 떨어뜨린다. 가로 스크롤보다 읽기 쉽다 */}
      <div className="flex flex-col md:flex-row md:items-stretch">
        {steps.map((step, index) => {
          const previous = index === 0 ? null : steps[index - 1];
          const dropped = drops[index];
          const rate = previous && previous.count > 0 ? (step.count / previous.count) * 100 : null;

          return (
            <Fragment key={step.label}>
              {previous ? (
                <div className="flex shrink-0 items-center justify-center gap-x-2 gap-y-0.5 py-2 pl-4 text-xs md:w-32 md:flex-col md:px-2 md:py-0 md:pl-2 md:text-center">
                  <HiArrowDown aria-hidden className="size-4 shrink-0 text-subtle md:hidden" />
                  <HiArrowRight
                    aria-hidden
                    className="hidden size-4 shrink-0 text-subtle md:block"
                  />
                  <span className="font-semibold tabular-nums text-foreground">
                    {rate === null ? "전환 —" : `전환 ${rate.toFixed(0)}%`}
                  </span>
                  <span className="text-muted">
                    {dropped > 0 ? `${dropped}명 미도달` : "전원 도달"}
                  </span>
                  {step.medianDaysFromPrevious != null ? (
                    <span className="text-subtle">{formatDays(step.medianDaysFromPrevious)}</span>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-1 items-baseline justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 md:min-w-0 md:flex-col md:items-start md:justify-start md:gap-1">
                <div className="md:order-2 md:min-w-0">
                  <p className="text-sm font-medium text-foreground">{step.label}</p>
                  {step.description ? (
                    <p className="mt-0.5 text-xs text-subtle">{step.description}</p>
                  ) : null}
                </div>
                <p className="shrink-0 text-lg font-semibold text-foreground tabular-nums md:order-1 md:text-2xl">
                  {step.count}
                  <span className="ml-1 text-xs font-normal text-muted">명</span>
                </p>
              </div>
            </Fragment>
          );
        })}
      </div>

      {notes.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {notes.map(({ step, next }) => (
            <li key={step.label} className="text-xs text-subtle">
              <span className="text-muted">
                {step.label} → {next.label}
              </span>{" "}
              {step.transitionNote}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * 일별 추이. 값이 0인 날도 자리를 차지해야 공백 기간이 보인다.
 * 툴팁은 CSS만으로 처리해 이 컴포넌트를 서버에 남긴다.
 */
export function DailyBars({ series }: { series: { day: string; count: number }[] }) {
  const max = Math.max(1, ...series.map((point) => point.count));

  return (
    <div>
      <div className="flex h-32 items-stretch gap-1">
        {series.map((point, index) => {
          // 양 끝 툴팁이 카드 밖으로 나가지 않도록 정렬을 바꾼다
          const alignment =
            index === 0
              ? "left-0"
              : index === series.length - 1
                ? "right-0"
                : "left-1/2 -translate-x-1/2";

          return (
            <div key={point.day} className="group relative flex flex-1 flex-col justify-end">
              <div
                className={cn(
                  "rounded-t transition-colors",
                  point.count > 0 ? "bg-primary/70 group-hover:bg-primary" : "bg-border",
                )}
                style={{ height: `${Math.max(2, (point.count / max) * 100)}%` }}
              />
              <span
                role="tooltip"
                className={cn(
                  "pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground shadow-lg group-hover:block",
                  alignment,
                )}
              >
                {point.day} · <span className="font-semibold tabular-nums">{point.count}</span>명
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-subtle">
        <span>{series[0]?.day}</span>
        <span>최대 {max}명</span>
        <span>{series[series.length - 1]?.day}</span>
      </div>
    </div>
  );
}
