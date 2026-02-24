"use client";

import type { ReviewHistoryEntry } from "@/types/review";

interface ReviewHistoryItemProps {
  entry: ReviewHistoryEntry;
  onClick: (entry: ReviewHistoryEntry) => void;
}

export default function ReviewHistoryItem({
  entry,
  onClick,
}: ReviewHistoryItemProps) {
  const date = new Date(entry.createdAt);
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  // 코드 미리보기: 첫 2줄
  const codePreview = entry.code
    .split("\n")
    .slice(0, 2)
    .join("\n")
    .slice(0, 100);

  return (
    <button
      onClick={() => onClick(entry)}
      className="w-full rounded-lg border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {entry.language}
        </span>
        <div className="flex items-center gap-2">
          {entry.score !== null && (
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {entry.score}/10
            </span>
          )}
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {dateStr}
          </span>
        </div>
      </div>
      <pre className="overflow-hidden text-ellipsis whitespace-pre-wrap font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {codePreview}
        {entry.code.length > 100 && "..."}
      </pre>
    </button>
  );
}
