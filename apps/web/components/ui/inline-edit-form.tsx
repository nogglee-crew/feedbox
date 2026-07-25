"use client";

import { useEffect, useState } from "react";
import { Input } from "./input";
import { SubmitButton } from "./submit-button";

interface InlineEditFormProps {
  /** 저장 서버 액션 */
  action: (formData: FormData) => void | Promise<void>;
  /** 편집 대상 필드명 */
  name: string;
  /** 저장된 현재 값 */
  initialValue: string;
  /** 함께 제출할 hidden 필드들 */
  hidden?: Record<string, string>;
  label?: string;
  ariaLabel?: string;
  placeholder?: string;
  type?: string;
  inputId?: string;
  inputClassName?: string;
  formClassName?: string;
  buttonLabel?: string;
}

/**
 * 값이 저장값과 달라졌을 때만 저장 버튼을 활성화하는 인라인 편집 폼.
 * 저장 후에는 서버가 새 initialValue를 내려주므로 다시 비활성화된다.
 */
export function InlineEditForm({
  action,
  name,
  initialValue,
  hidden = {},
  label,
  ariaLabel,
  placeholder,
  type,
  inputId,
  inputClassName,
  formClassName,
  buttonLabel = "저장",
}: InlineEditFormProps) {
  const [value, setValue] = useState(initialValue);

  // 저장이 반영되면 initialValue가 바뀌므로 입력값을 다시 맞춘다
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const changed = value.trim() !== initialValue.trim();

  return (
    <form action={action} className={formClassName}>
      {Object.entries(hidden).map(([key, val]) => (
        <input key={key} type="hidden" name={key} value={val} />
      ))}
      <Input
        id={inputId}
        name={name}
        type={type}
        label={label}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
      <SubmitButton variant="secondary" disabled={!changed} pendingText="저장 중...">
        {buttonLabel}
      </SubmitButton>
    </form>
  );
}
