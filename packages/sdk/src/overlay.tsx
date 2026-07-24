import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createIssue } from "./api";
import { captureScreenshot } from "./screenshot";
import { buildSelector, elementText } from "./selector";
import type { FeedboxConfig, FeedboxSessionInfo } from "./types";

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
  buttonGhost: {
    border: "1px solid #374151",
    borderRadius: 8,
    padding: "6px 11px",
    fontSize: 13,
    cursor: "pointer",
    background: "transparent",
    color: "#d1d5db",
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
} satisfies Record<string, React.CSSProperties>;

export function FeedboxOverlay({
  config,
  session,
}: {
  config: FeedboxConfig;
  session: FeedboxSessionInfo;
}) {
  const [mode, setMode] = useState<Mode>("idle");
  const [hoverRect, setHoverRect] = useState<Rect | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [memo, setMemo] = useState("");
  const [withScreenshot, setWithScreenshot] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // picking 모드: capture 단계에서 hover/click을 가로채 페이지 동작을 막는다
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

  const submit = useCallback(async () => {
    if (!target || !memo.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const screenshot = withScreenshot ? await captureScreenshot() : null;
      const issue = await createIssue(config, session.token, {
        pageUrl: window.location.href,
        selector: target.selector,
        elementText: target.text,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        browser: navigator.userAgent,
        memo: memo.trim(),
        screenshot,
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
          <div style={styles.panelHeader}>QA 이슈 등록 · {session.releaseVersion}</div>
          <div style={styles.panelBody as React.CSSProperties}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>선택한 요소</div>
              <code style={styles.code}>{target.selector}</code>
              {target.text && (
                <div style={{ marginTop: 4, color: "#6b7280", fontSize: 12 }}>“{target.text}”</div>
              )}
            </div>
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
              <button type="button" style={styles.buttonGhost as React.CSSProperties} onClick={reset}>
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
        <span style={{ fontWeight: 700 }}>QA</span>
        <span style={{ color: "#9ca3af" }}>{session.projectName} · {session.releaseVersion}</span>
        <a
          data-feedbox="board-link"
          href={`${(config.apiBaseUrl ?? "").replace(/\/$/, "")}/board/${session.token}`}
          target="_blank"
          rel="noreferrer"
          style={{ ...(styles.buttonGhost as React.CSSProperties), textDecoration: "none" }}
        >
          이슈 현황
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
            style={styles.button as React.CSSProperties}
            onClick={() => {
              reset();
              setMode("picking");
            }}
          >
            요소 선택
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
