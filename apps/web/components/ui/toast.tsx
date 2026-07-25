"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
} from "react-icons/hi2";
import { trackEvent } from "@/lib/analytics";
import { cn } from "./cn";

export type ToastTone = "success" | "danger" | "info";

export interface ToastMessage {
  id?: string;
  message: string;
  tone?: ToastTone;
  /** 서버 액션 성공 시 1회 전송할 GA4 이벤트 이름 */
  event?: string;
}

/** event는 표시에 쓰이지 않고 initialToast에서 1회 전송하고 끝난다 */
type ToastDisplay = Required<Omit<ToastMessage, "event">>;

type ToastItem = ToastDisplay & {
  leaving: boolean;
};

interface ToastProps {
  message: string;
  /** 16px 아이콘. react-icons는 1em이라 별도 크기 지정 없이 맞는다 */
  icon?: ReactNode;
  /** 오른쪽 텍스트 액션. 디자인상 아이콘과 함께 쓰지 않는다 */
  action?: { label: string; onClick: () => void };
  leaving?: boolean;
  className?: string;
}

/**
 * 어두운 표면 위에 얹히므로 Button 계열(밝은 표면 전제)을 쓰지 않는다.
 * 색으로 성패를 구분하지 않고 문구로만 전달한다.
 */
export function Toast({ message, icon, action, leaving = false, className }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto flex min-h-12 w-full items-center gap-2 rounded-xl bg-surface-inverse px-4 py-2",
        "text-base/5 font-normal text-on-inverse",
        leaving ? "toast-slide-out" : "toast-slide-in",
        className,
      )}
    >
      {icon && !action && <span className="flex shrink-0 items-center">{icon}</span>}
      <span className="flex-1">{message}</span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            "shrink-0 text-sm/4.5 text-on-inverse hover:underline",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-inverse",
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/** 토스트를 쌓아 올리는 고정 영역. 뒤쪽 클릭을 막지 않는다 */
export function ToastViewport({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-6 z-50 mx-auto flex w-full max-w-sm flex-col gap-2 px-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ToastContextValue {
  showToast: (toast: string | ToastMessage) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICON: Record<ToastTone, ReactNode> = {
  success: <HiCheckCircle aria-hidden className="size-4" />,
  danger: <HiExclamationCircle aria-hidden className="size-4" />,
  info: <HiInformationCircle aria-hidden className="size-4" />,
};

const TOAST_VISIBLE_MS = 2600;
const TOAST_EXIT_MS = 180;

function createToastId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function normalizeToast(toast: string | ToastMessage): ToastDisplay {
  if (typeof toast === "string") {
    return { id: createToastId(), message: toast, tone: "info" };
  }
  return {
    id: toast.id ?? createToastId(),
    message: toast.message,
    tone: toast.tone ?? "info",
  };
}

export function ToastProvider({
  children,
  initialToast,
}: {
  children: ReactNode;
  initialToast?: ToastMessage | null;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const displayedInitialToastId = useRef<string | null>(null);

  const showToast = useCallback((toast: string | ToastMessage) => {
    const next: ToastItem = { ...normalizeToast(toast), leaving: false };
    setToasts((current) => [...current.slice(-2), next]);
    window.setTimeout(() => {
      setToasts((current) =>
        current.map((item) => (item.id === next.id ? { ...item, leaving: true } : item)),
      );
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== next.id));
      }, TOAST_EXIT_MS);
    }, TOAST_VISIBLE_MS);
  }, []);

  useEffect(() => {
    if (!initialToast || displayedInitialToastId.current === initialToast.id) return;
    displayedInitialToastId.current = initialToast.id ?? null;
    showToast(initialToast);
    if (initialToast.event) trackEvent(initialToast.event);
    void fetch("/api/flash-toast", { method: "DELETE" });
  }, [initialToast, showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            icon={TONE_ICON[toast.tone]}
            leaving={toast.leaving}
          />
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
