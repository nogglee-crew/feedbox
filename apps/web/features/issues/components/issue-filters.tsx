"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ISSUE_STATUS_LABEL } from "@/features/issues/components/issue-status";
import { ISSUE_STATUSES } from "@/lib/types";

export function IssueFilters({ q = "", status = "" }: { q?: string; status?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(q);

  // 뒤로가기나 지우기로 URL이 바뀌면 입력값도 따라가야 한다
  useEffect(() => {
    setQuery(q);
  }, [q]);

  const apply = (nextQuery: string, nextStatus: string) => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextStatus) params.set("status", nextStatus);
    const search = params.toString();
    router.push(search ? `${pathname}?${search}` : pathname);
  };

  return (
    <form
      className="ml-auto flex w-full max-w-xl items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        apply(query, status);
      }}
    >
      <div className="relative flex-1">
        <Input
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="이슈 검색"
          placeholder="메모/URL/요소/에러/API 검색 (Enter)"
          className="w-full pr-9"
        />
        {query && (
          <IconButton
            size="sm"
            label="검색어 지우기"
            icon={<HiXMark aria-hidden className="size-4" />}
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => {
              setQuery("");
              apply("", status);
            }}
          />
        )}
      </div>
      <div className="w-32 shrink-0">
        <Select
          name="status"
          value={status}
          aria-label="상태 필터"
          onChange={(e) => apply(query, e.target.value)}
        >
          <option value="">전체 상태</option>
          {ISSUE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ISSUE_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>
    </form>
  );
}
