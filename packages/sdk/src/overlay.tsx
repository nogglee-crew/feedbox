import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createIssue } from "./api";
import { getRecentDiagnostics } from "./diagnostics";
import { captureScreenshot } from "./screenshot";
import { buildSelector, elementText } from "./selector";
import type {
  FeedboxConfig,
  FeedboxSessionInfo,
  IssueDiagnostics,
} from "./types";

type Mode = "idle" | "picking" | "editing";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Target {
  selector: string;
  text: string | null;
  rect: Rect;
  diagnostics: IssueDiagnostics | null;
}

const Z = 2147483000;

const styles = {
  toolbar: {
    position: "fixed",
    bottom: 20,
    right: 20,
    zIndex: Z + 3,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#111827",
    color: "#f9fafb",
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 13,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    flex: "0 0 auto",
  },
  statusDotOpen: {
    background: "#22c55e",
    boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.55)",
    animation: "feedbox-status-pulse 1.35s ease-out infinite",
  },
  statusDotClosed: {
    background: "#6b7280",
    boxShadow: "none",
  },
  button: {
    border: "none",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    background: "#6366f1",
    color: "#ffffff",
  },
  // 어두운 툴바 위에서 쓴다
  buttonGhost: {
    border: "1px solid #374151",
    borderRadius: 8,
    padding: "6px 11px",
    fontSize: 13,
    cursor: "pointer",
    background: "transparent",
    color: "#d1d5db",
  },
  // 흰 패널 위에서 쓴다
  buttonQuiet: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "6px 11px",
    fontSize: 13,
    cursor: "pointer",
    background: "transparent",
    color: "#6b7280",
  },
  highlight: {
    position: "fixed",
    zIndex: Z,
    pointerEvents: "none",
    border: "2px solid #6366f1",
    background: "rgba(99, 102, 241, 0.12)",
    borderRadius: 4,
    transition: "all 60ms linear",
  },
  panel: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: Z + 4,
    width: 340,
    maxWidth: "calc(100vw - 40px)",
    borderRadius: 14,
    background: "#ffffff",
    color: "#111827",
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 13,
    overflow: "hidden",
  },
  panelHeader: {
    padding: "12px 16px",
    background: "#111827",
    color: "#f9fafb",
    fontWeight: 700,
    fontSize: 13,
  },
  panelBody: { padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  code: {
    display: "block",
    padding: "6px 8px",
    borderRadius: 6,
    background: "#f3f4f6",
    color: "#374151",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 11,
    wordBreak: "break-all",
    maxHeight: 60,
    overflow: "auto",
  },
  textarea: {
    width: "100%",
    minHeight: 90,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 13,
    fontFamily: "inherit",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
  },
  toast: {
    position: "fixed",
    bottom: 80,
    right: 20,
    zIndex: Z + 5,
    padding: "10px 16px",
    borderRadius: 10,
    background: "#059669",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 600,
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  entryNotice: {
    position: "fixed",
    top: "50%",
    left: "50%",
    zIndex: Z + 6,
    transform: "translate(-50%, -50%)",
    width: 380,
    maxWidth: "calc(100vw - 40px)",
    padding: "24px 26px",
    borderRadius: 16,
    background: "#111827",
    color: "#f9fafb",
    boxShadow: "0 18px 60px rgba(0,0,0,0.4)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    textAlign: "center",
    pointerEvents: "none",
  },
  entryScrim: {
    position: "fixed",
    inset: 0,
    zIndex: Z + 5,
    background: "rgba(17, 24, 39, 0.38)",
    pointerEvents: "none",
  },
  entryNoticeTitle: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.35,
  },
  entryNoticeDescription: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 1.5,
    color: "#d1d5db",
  },
} satisfies Record<string, React.CSSProperties>;

export function FeedboxLoadingToolbar() {
  return createPortal(
    <div
      data-feedbox="toolbar"
      aria-busy="true"
      aria-label="피드백 세션 확인 중"
      style={styles.toolbar as React.CSSProperties}
    >
      <span
        data-feedbox="status-dot"
        style={{
          ...styles.statusDot,
          ...styles.statusDotClosed,
        } as React.CSSProperties}
      />
      <span style={{ fontWeight: 700 }}>피드백 모드</span>
      <span style={{ color: "#9ca3af" }}>세션 확인 중...</span>
      <button
        type="button"
        disabled
        style={{
          ...(styles.button as React.CSSProperties),
          opacity: 0.5,
          cursor: "not-allowed",
        }}
      >
        피드백 남기기
      </button>
    </div>,
    document.body,
  );
}

export function FeedboxOverlay({
  config,
  session,
  entryNoticeKey = 0,
}: {
  config: FeedboxConfig;
  session: FeedboxSessionInfo;
  entryNoticeKey?: number;
}) {
  const [mode, setMode] = useState<Mode>("idle");
  const [hoverRect, setHoverRect] = useState<Rect | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [memo, setMemo] = useState("");
  const [withScreenshot, setWithScreenshot] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showEntryNotice, setShowEntryNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFeedbackOpen = session.releaseStatus === "OPEN";

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!entryNoticeKey) return;
    setShowEntryNotice(true);
  }, [entryNoticeKey]);

  useEffect(() => {
    if (!showEntryNotice) return;
    const timer = window.setTimeout(() => setShowEntryNotice(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showEntryNotice]);

  // Capture phase prevents the host page from handling selection clicks.
  useEffect(() => {
    if (mode !== "picking") return;

    const isOwnUi = (node: EventTarget | null): boolean =>
      node instanceof Element && node.closest("[data-feedbox]") !== null;

    const onMove = (e: MouseEvent) => {
      if (isOwnUi(e.target)) {
        setHoverRect(null);
        return;
      }
      const el = e.target as Element;
      const r = el.getBoundingClientRect();
      setHoverRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const onClick = (e: MouseEvent) => {
      if (isOwnUi(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.target as Element;
      const r = el.getBoundingClientRect();
      setTarget({
        selector: buildSelector(el),
        text: elementText(el),
        rect: { top: r.top, left: r.left, width: r.width, height: r.height },
        diagnostics: getRecentDiagnostics(),
      });
      setMode("editing");
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHoverRect(null);
        setMode("idle");
      }
    };

    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [mode]);

  const reset = useCallback(() => {
    setMode("idle");
    setHoverRect(null);
    setTarget(null);
    setMemo("");
    setError(null);
    setWithScreenshot(true);
  }, []);

  useEffect(() => {
    if (mode !== "editing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) reset();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [mode, reset, submitting]);

  // ESC를 토글로 쓴다. picking에서 나가는 것뿐 아니라 들어가는 것도 같은 키로 한다
  useEffect(() => {
    if (mode !== "idle" || !isFeedbackOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const el = document.activeElement;
      // 호스트 페이지에서 입력 중이면 그쪽 ESC를 빼앗지 않는다
      if (el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) {
        return;
      }
      reset();
      setMode("picking");
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [mode, isFeedbackOpen, reset]);

  const submit = useCallback(async () => {
    if (!target || !memo.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const screenshot = withScreenshot ? await captureScreenshot(target.rect) : null;
      const issue = await createIssue(config, session.token, {
        pageUrl: window.location.href,
        selector: target.selector,
        elementText: target.text,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        browser: navigator.userAgent,
        memo: memo.trim(),
        screenshot,
        diagnostics: target.diagnostics,
      });
      reset();
      showToast(`이슈 #${issue.id} 등록 완료`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "이슈 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }, [config, session.token, target, memo, withScreenshot, submitting, reset, showToast]);

  const activeRect = mode === "editing" ? target?.rect ?? null : hoverRect;

  return createPortal(
    <div data-feedbox="root">
      {showEntryNotice && (
        <>
          <div data-feedbox="entry-scrim" style={styles.entryScrim as React.CSSProperties} />
          <div data-feedbox="entry-notice" style={styles.entryNotice as React.CSSProperties}>
            <div style={styles.entryNoticeTitle}>피드백 모드에 진입했습니다.</div>
            <div style={styles.entryNoticeDescription}>
              화면에서 문제가 있는 요소를 선택해 피드백을 남길 수 있습니다.
            </div>
          </div>
        </>
      )}

      {activeRect && (
        <div
          data-feedbox="highlight"
          style={{
            ...styles.highlight,
            top: activeRect.top,
            left: activeRect.left,
            width: activeRect.width,
            height: activeRect.height,
          }}
        />
      )}

      {mode === "editing" && target && (
        <div data-feedbox="panel" style={styles.panel}>
          <div style={styles.panelHeader}>피드백 등록 · {session.releaseVersion}</div>
          <div style={styles.panelBody as React.CSSProperties}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>선택한 요소</div>
              <code style={styles.code}>{target.selector}</code>
              {target.text && (
                <div style={{ marginTop: 4, color: "#6b7280", fontSize: 12 }}>“{target.text}”</div>
              )}
            </div>
            {target.diagnostics && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>최근 감지된 에러</div>
                <code style={styles.code}>
                  {target.diagnostics.error.name} · {target.diagnostics.error.code}
                </code>
                <div style={{ marginTop: 4, color: "#6b7280", fontSize: 12 }}>
                  {target.diagnostics.error.message}
                </div>
                {target.diagnostics.request && (
                  <div style={{ marginTop: 4, color: "#6b7280", fontSize: 12 }}>
                    {target.diagnostics.request.method} {target.diagnostics.request.url}
                    {target.diagnostics.request.status
                      ? ` · ${target.diagnostics.request.status}`
                      : ""}
                  </div>
                )}
              </div>
            )}
            <textarea
              style={styles.textarea as React.CSSProperties}
              placeholder="어떤 문제가 있나요? (예: 버튼을 눌러도 반응이 없어요)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              autoFocus
            />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151" }}>
              <input
                type="checkbox"
                checked={withScreenshot}
                onChange={(e) => setWithScreenshot(e.target.checked)}
              />
              스크린샷 첨부
            </label>
            {error && <div style={{ color: "#dc2626", fontSize: 12 }}>{error}</div>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" style={styles.buttonQuiet as React.CSSProperties} onClick={reset}>
                취소
              </button>
              <button
                type="button"
                style={{
                  ...(styles.button as React.CSSProperties),
                  opacity: memo.trim() && !submitting ? 1 : 0.5,
                }}
                disabled={!memo.trim() || submitting}
                onClick={submit}
              >
                {submitting ? "등록 중..." : "이슈 등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div data-feedbox="toolbar" style={styles.toolbar as React.CSSProperties}>
        <style>
          {`
            @keyframes feedbox-status-pulse {
              0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55); }
              70% { box-shadow: 0 0 0 7px rgba(34, 197, 94, 0); }
              100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
            }
            @media (prefers-reduced-motion: reduce) {
              [data-feedbox="status-dot"] { animation: none !important; }
            }
          `}
        </style>
        <span
          data-feedbox="status-dot"
          title={isFeedbackOpen ? "피드백 모드 열림" : "피드백 모드 닫힘"}
          style={{
            ...styles.statusDot,
            ...(isFeedbackOpen ? styles.statusDotOpen : styles.statusDotClosed),
          } as React.CSSProperties}
        />
        <span style={{ fontWeight: 700 }}>피드백 모드</span>
        <span style={{ color: "#9ca3af" }}>
          {session.projectName} · {session.releaseVersion}
        </span>
        <a
          data-feedbox="board-link"
          href={`${(config.apiBaseUrl ?? "").replace(/\/$/, "")}/board/${session.token}`}
          target="_blank"
          rel="noreferrer"
          style={{ ...(styles.buttonGhost as React.CSSProperties), textDecoration: "none" }}
        >
          이슈 보드
        </a>
        {mode === "picking" ? (
          <button
            type="button"
            style={styles.buttonGhost as React.CSSProperties}
            onClick={() => {
              setHoverRect(null);
              setMode("idle");
            }}
          >
            선택 취소 (ESC)
          </button>
        ) : (
          <button
            type="button"
            style={{
              ...(styles.button as React.CSSProperties),
              opacity: isFeedbackOpen ? 1 : 0.5,
              cursor: isFeedbackOpen ? "pointer" : "not-allowed",
            }}
            disabled={!isFeedbackOpen}
            onClick={() => {
              if (!isFeedbackOpen) return;
              reset();
              setMode("picking");
            }}
          >
            피드백 남기기 (ESC)
          </button>
        )}
      </div>

      {toast && (
        <div data-feedbox="toast" style={styles.toast as React.CSSProperties}>
          {toast}
        </div>
      )}
    </div>,
    document.body,
  );
}
