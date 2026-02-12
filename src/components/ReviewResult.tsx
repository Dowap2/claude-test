"use client";

interface ReviewResultProps {
  review: string;
  error: string;
}

export default function ReviewResult({ review, error }: ReviewResultProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        리뷰 결과
      </h2>
      <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
        {review}
      </div>
    </div>
  );
}
