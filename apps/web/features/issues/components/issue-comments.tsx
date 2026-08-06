"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HiArrowUp, HiEllipsisHorizontal, HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import {
  editDashboardIssueComment,
  editIssueComment,
  loadDashboardIssueComments,
  loadIssueComments,
  removeDashboardIssueComment,
  removeIssueComment,
  submitDashboardIssueComment,
  submitIssueComment,
} from "@/app/comment-actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Menu, menuItemClasses } from "@/components/ui/menu";
import { RelativeTime } from "@/components/ui/relative-time";
import type {
  IssueComment,
  IssueCommentAuthor,
  IssueCommentSummary,
  IssueCommentViewer,
} from "@/lib/types";

const GUEST_KEY_STORAGE = "feedbox:guest-key";

/** 공개 보드는 세션 토큰으로, 관리자 목록은 조직 멤버십으로 인가한다 */
export type IssueCommentScope =
  | { kind: "board"; token: string }
  | { kind: "dashboard"; orgSlug: string };

/** 익명 테스터를 브라우저 단위로 식별하는 키. 계정이 아니라 표시 라벨·본인 판정용이다 */
function getGuestKey(): string {
  try {
    const existing = localStorage.getItem(GUEST_KEY_STORAGE);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(GUEST_KEY_STORAGE, created);
    return created;
  } catch {
    return "anonymous";
  }
}

function authorName(author: IssueCommentAuthor): string {
  return author.kind === "member" ? author.name : author.label;
}

export function CommentAvatar({ author, size = "md" }: { author: IssueCommentAuthor; size?: "sm" | "md" }) {
  if (author.kind === "member") {
    return <Avatar name={author.name} src={author.avatar_url} size={size} />;
  }
  // "테스터 A"는 첫 글자가 전부 "테"라 구분이 안 되므로 라벨 문자를 이니셜로 쓴다
  return <Avatar name={author.label.split(" ").pop() ?? author.label} size={size} />;
}

export function IssueComments({
  scope,
  issueId,
  initialSummary,
  viewer,
}: {
  scope: IssueCommentScope;
  issueId: number;
  initialSummary: IssueCommentSummary;
  viewer: IssueCommentViewer | null;
}) {
  const [count, setCount] = useState(initialSummary.count);
  const [latest, setLatest] = useState(initialSummary.latest);
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [olderCount, setOlderCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // 접힌 줄을 눌러 펼치면 바로 입력할 수 있게 입력창에 포커스를 준다
  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  const loadPage = useCallback(
    (before?: number | null) =>
      scope.kind === "board"
        ? loadIssueComments({ token: scope.token, issueId, before, guestKey: getGuestKey() })
        : loadDashboardIssueComments({ orgSlug: scope.orgSlug, issueId, before }),
    [scope, issueId],
  );

  const expand = useCallback(async () => {
    setExpanded(true);
    if (count === 0) return;
    setLoading(true);
    try {
      const page = await loadPage();
      setComments(page.comments);
      setOlderCount(page.olderCount);
    } finally {
      setLoading(false);
    }
  }, [loadPage, count]);

  const loadOlder = useCallback(async () => {
    if (loading || comments.length === 0) return;
    setLoading(true);
    try {
      const page = await loadPage(comments[0].id);
      setComments((prev) => [...page.comments, ...prev]);
      setOlderCount(page.olderCount);
    } finally {
      setLoading(false);
    }
  }, [loading, comments, loadPage]);

  // 입력 내용에 맞춰 한 줄부터 자연스럽게 늘어난다 (노션 코멘트 입력 방식)
  const autoGrow = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const submit = useCallback(async () => {
    if (submitting || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    const result =
      scope.kind === "board"
        ? await submitIssueComment({
            token: scope.token,
            issueId,
            body,
            guestKey: getGuestKey(),
          })
        : await submitDashboardIssueComment({ orgSlug: scope.orgSlug, issueId, body });
    setSubmitting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setComments((prev) => [...prev, result.comment]);
    setCount((prev) => prev + 1);
    setLatest(result.comment);
    setBody("");
    requestAnimationFrame(autoGrow);
  }, [submitting, body, scope, issueId, autoGrow]);

  const saveEdit = useCallback(
    async (commentId: number) => {
      if (!editBody.trim()) return;
      setError(null);
      const result =
        scope.kind === "board"
          ? await editIssueComment({
              token: scope.token,
              commentId,
              body: editBody,
              guestKey: getGuestKey(),
            })
          : await editDashboardIssueComment({ orgSlug: scope.orgSlug, commentId, body: editBody });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setComments((prev) => prev.map((c) => (c.id === commentId ? result.comment : c)));
      setLatest((prev) => (prev?.id === commentId ? result.comment : prev));
      setEditingId(null);
    },
    [editBody, scope],
  );

  const remove = useCallback(
    async (commentId: number) => {
      setError(null);
      const result =
        scope.kind === "board"
          ? await removeIssueComment({ token: scope.token, commentId, guestKey: getGuestKey() })
          : await removeDashboardIssueComment({ orgSlug: scope.orgSlug, commentId });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setComments((prev) => {
        const next = prev.filter((c) => c.id !== commentId);
        // 접힌 미리보기는 로드된 것 중 마지막으로 되돌린다. 미로드분까지 정확할 필요는 없다
        setLatest((latestPrev) =>
          latestPrev?.id === commentId ? (next[next.length - 1] ?? null) : latestPrev,
        );
        return next;
      });
      setCount((prev) => Math.max(0, prev - 1));
    },
    [scope],
  );

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => void expand()}
        className={cn(
          "flex w-full min-w-0 items-center gap-2 border-t border-border pt-3 text-left text-sm",
          "text-muted transition-colors hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        )}
      >
        <HiOutlineChatBubbleOvalLeft aria-hidden className="size-4 shrink-0" />
        {latest ? (
          <>
            <span className="shrink-0 font-semibold">{count}</span>
            <CommentAvatar author={latest.author} size="sm" />
            <span className="min-w-0 truncate">{latest.body}</span>
            <span aria-hidden className="shrink-0 text-subtle">
              ·
            </span>
            <RelativeTime value={latest.created_at} className="shrink-0 text-xs text-subtle" />
          </>
        ) : (
          <span>댓글 달기</span>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <HiOutlineChatBubbleOvalLeft aria-hidden className="size-4" />
        댓글{count > 0 ? ` ${count}` : ""} 접기
      </button>

      {olderCount > 0 && (
        <Button variant="ghost" size="sm" disabled={loading} onClick={() => void loadOlder()}>
          이전 댓글 {olderCount}개 보기
        </Button>
      )}
      {loading && comments.length === 0 && <p className="text-xs text-subtle">불러오는 중...</p>}

      {comments.length > 0 && (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-2">
              <CommentAvatar author={comment.author} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-semibold">{authorName(comment.author)}</span>
                  <RelativeTime value={comment.created_at} className="text-xs text-subtle" />
                </div>
                {editingId === comment.id ? (
                  <div className="mt-1 space-y-2">
                    <textarea
                      rows={2}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full resize-none rounded-md border border-border bg-transparent px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus/30"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary" onClick={() => void saveEdit(comment.id)}>
                        저장
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
                )}
              </div>
              {(comment.mine || comment.deletable) && editingId !== comment.id && (
                <Menu
                  label="코멘트 관리"
                  align="right"
                  trigger={
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-md text-subtle",
                        "transition-colors hover:bg-surface-hover hover:text-foreground",
                      )}
                    >
                      <HiEllipsisHorizontal aria-hidden className="size-4" />
                    </span>
                  }
                >
                  {(close) => (
                    <>
                      {comment.mine && (
                        <button
                          type="button"
                          className={menuItemClasses()}
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditBody(comment.body);
                            close();
                          }}
                        >
                          수정
                        </button>
                      )}
                      {comment.deletable && (
                        <button
                          type="button"
                          className={menuItemClasses("text-danger")}
                          onClick={() => {
                            void remove(comment.id);
                            close();
                          }}
                        >
                          삭제
                        </button>
                      )}
                    </>
                  )}
                </Menu>
              )}
            </li>
          ))}
        </ul>
      )}

      <div>
        <div
          className={cn(
            "-mx-2 flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors",
            "focus-within:bg-surface-hover",
          )}
        >
          {viewer ? (
            <Avatar name={viewer.name} src={viewer.avatar_url} />
          ) : (
            <Avatar name="테스터" />
          )}
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="댓글 추가"
            value={body}
            disabled={submitting}
            onChange={(e) => {
              setBody(e.target.value);
              autoGrow();
            }}
            onKeyDown={(e) => {
              // Enter 전송, Shift+Enter 줄바꿈. 한글 조합 중 Enter는 무시한다
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void submit();
              }
            }}
            className="min-w-0 flex-1 resize-none self-center bg-transparent text-sm placeholder:text-subtle focus:outline-none"
          />
          <button
            type="button"
            aria-label="댓글 등록"
            disabled={submitting || !body.trim()}
            onClick={() => void submit()}
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
              body.trim() && !submitting
                ? "bg-primary text-on-primary hover:bg-primary-hover"
                : "bg-surface-muted text-subtle",
            )}
          >
            <HiArrowUp aria-hidden className="size-3.5" />
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    </div>
  );
}
