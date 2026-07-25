"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "./cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** 확인/취소 버튼 영역. 오른쪽 정렬된다 */
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * 네이티브 <dialog>의 showModal()을 쓴다.
 * 포커스 트랩, 뒤쪽 콘텐츠 inert 처리, Esc 닫기를 브라우저가 담당한다.
 */
export function Modal({ open, onClose, title, footer, className, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // 백드롭 클릭 판정. 클릭 대상이 dialog여도 패딩 영역일 수 있어 좌표로 확인한다
      onClick={(e) => {
        const dialog = ref.current;
        if (!dialog || e.target !== dialog) return;
        const box = dialog.getBoundingClientRect();
        const outside =
          e.clientX < box.left ||
          e.clientX > box.right ||
          e.clientY < box.top ||
          e.clientY > box.bottom;
        if (outside) onClose();
      }}
      className={cn(
        "m-auto w-full max-w-sm rounded-2xl bg-surface p-6 text-foreground shadow-lg",
        "backdrop:bg-black/40",
        className,
      )}
    >
      <h2 id={titleId} className="text-lg font-bold">
        {title}
      </h2>
      {children}
      {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
    </dialog>
  );
}
