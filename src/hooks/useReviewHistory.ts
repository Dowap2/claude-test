"use client";

import { useState, useCallback } from "react";
import type { ReviewHistoryEntry } from "@/types/review";

export function useReviewHistory() {
  const [entries, setEntries] = useState<ReviewHistoryEntry[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async (cursor?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/notion/history?${params}`);
      if (!res.ok) throw new Error("히스토리 조회 실패");
      const data = await res.json();

      if (cursor) {
        // 더 보기: 기존 목록에 추가
        setEntries((prev) => [...prev, ...data.results]);
      } else {
        // 초기/새로고침: 목록 교체
        setEntries(data.results);
      }
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("히스토리 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (nextCursor && !isLoading) {
      fetchHistory(nextCursor);
    }
  }, [nextCursor, isLoading, fetchHistory]);

  const refresh = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { entries, hasMore, isLoading, loadMore, refresh, fetchHistory };
}
