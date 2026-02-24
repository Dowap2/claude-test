"use client";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "disabled";

interface SaveIndicatorProps {
  status: SaveStatus;
}

export default function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === "idle" || status === "disabled") return null;

  const config = {
    saving: {
      text: "Notion에 저장 중...",
      className:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    },
    saved: {
      text: "Notion에 저장 완료",
      className:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    },
    error: {
      text: "저장 실패 (리뷰는 정상 표시됩니다)",
      className:
        "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
    },
  } as const;

  const { text, className } = config[status];

  return (
    <div className={`rounded-md border px-3 py-1.5 text-xs ${className}`}>
      {status === "saving" && (
        <span className="mr-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent align-middle" />
      )}
      {text}
    </div>
  );
}
