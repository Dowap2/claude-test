"use client";

import type { ReviewHistoryEntry } from "@/types/review";
import ReviewHistoryItem from "@/components/ReviewHistoryItem";

interface ReviewHistoryProps {
  entries: ReviewHistoryEntry[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onSelect: (entry: ReviewHistoryEntry) => void;
}

export default function ReviewHistory({
  entries,
  hasMore,
  isLoading,
  onLoadMore,
  onSelect,
}: ReviewHistoryProps) {
  if (isLoading && entries.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        히스토리 불러오는 중...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        저장된 리뷰가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <ReviewHistoryItem key={entry.id} entry={entry} onClick={onSelect} />
      ))}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
        >
          {isLoading ? "불러오는 중..." : "더 보기"}
        </button>
      )}
    </div>
  );
}
