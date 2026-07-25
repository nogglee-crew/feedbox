"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Page<T> {
  items: T[];
  nextCursor: number | null;
}

/**
 * 커서 기반 무한 스크롤. initial로 첫 페이지를 받고,
 * sentinel이 보이면 fetchPage(cursor)로 다음 페이지를 이어붙인다.
 * resetKey가 바뀌면(필터 변경 등) 목록을 initial로 되돌린다.
 */
export function useInfiniteScroll<T>({
  initialItems,
  initialCursor,
  fetchPage,
  resetKey,
}: {
  initialItems: T[];
  initialCursor: number | null;
  fetchPage: (cursor: number | null) => Promise<Page<T>>;
  resetKey?: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 필터 변경 등으로 서버가 새 첫 페이지를 내려주면 목록을 갈아끼운다
  useEffect(() => {
    setItems(initialItems);
    setCursor(initialCursor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const loadMore = useCallback(async () => {
    if (loading || cursor === null) return;
    setLoading(true);
    try {
      const page = await fetchPage(cursor);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [loading, cursor, fetchPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || cursor === null) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, cursor]);

  return { items, sentinelRef, loading, hasMore: cursor !== null };
}
