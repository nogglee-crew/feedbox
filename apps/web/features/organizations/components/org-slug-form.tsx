"use client";

import { useEffect, useMemo, useState } from "react";
import { checkOrgSlug, updateOrgSlug } from "@/app/org-actions";
import { describedBy, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { normalizeOrgSlug } from "@/lib/org-slugs";

const GUIDE = "영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.";
const MIN_LENGTH = 3;

export function OrgSlugForm({ orgId, slug }: { orgId: string; slug: string }) {
  const [value, setValue] = useState(slug);
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [message, setMessage] = useState("");
  const normalized = useMemo(() => normalizeOrgSlug(value), [value]);
  const changed = normalized !== slug;
  const tooShort = changed && normalized.length < MIN_LENGTH;
  const fieldId = `org-slug-${orgId}`;

  useEffect(() => {
    setValue(slug);
  }, [slug]);

  useEffect(() => {
    // 길이 미달은 서버에 물어볼 필요 없이 즉시 판정한다
    if (!changed || normalized.length < MIN_LENGTH) {
      setStatus("idle");
      setMessage("");
      return;
    }

    setStatus("checking");
    // 타이핑이 멈춘 뒤에만 서버에 물어보도록 디바운스를 넉넉히 둔다
    const timer = window.setTimeout(() => {
      void checkOrgSlug(orgId, normalized).then((result) => {
        setStatus(result.available ? "available" : "taken");
        setMessage(result.available ? "사용할 수 있습니다" : (result.error ?? "사용중인 주소입니다"));
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [changed, normalized, orgId]);

  const hint = status === "checking" ? "확인 중..." : GUIDE;
  const error = tooShort ? GUIDE : status === "taken" ? message : undefined;
  const success = status === "available" ? message : undefined;

  return (
    <form action={updateOrgSlug} className="mt-4">
      <input type="hidden" name="org_id" value={orgId} />
      <input type="hidden" name="current_slug" value={slug} />
      {/* 라벨·안내문은 행 전체를 차지하고, 입력창과 버튼만 같은 줄에 둔다 */}
      <Field id={fieldId} label="팀 URL" hint={hint} error={error} success={success}>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id={fieldId}
            name="slug"
            value={value}
            onChange={(e) => setValue(normalizeOrgSlug(e.target.value))}
            aria-describedby={describedBy(fieldId, hint, error, success)}
            aria-invalid={error ? true : undefined}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            minLength={MIN_LENGTH}
            maxLength={32}
            required
            className="w-64"
          />
          <SubmitButton
            variant="secondary"
            disabled={!changed || status !== "available"}
            pendingText="저장 중..."
          >
            저장
          </SubmitButton>
        </div>
      </Field>
    </form>
  );
}
