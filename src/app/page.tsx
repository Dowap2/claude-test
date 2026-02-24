"use client";

import { useState, useEffect, useCallback } from "react";
import CodeInput from "@/components/CodeInput";
import ReviewResult from "@/components/ReviewResult";
import SaveIndicator from "@/components/SaveIndicator";
import type { SaveStatus } from "@/components/SaveIndicator";
import NotionSetupGuide from "@/components/NotionSetupGuide";
import ReviewHistory from "@/components/ReviewHistory";
import { useReviewHistory } from "@/hooks/useReviewHistory";
import type { ReviewHistoryEntry } from "@/types/review";

type ViewMode = "write" | "history" | "guide";

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [review, setReview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Notion 관련 상태
  const [notionConnected, setNotionConnected] = useState(false);
  const [notionConfigured, setNotionConfigured] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [viewMode, setViewMode] = useState<ViewMode>("write");

  const { entries, hasMore, isLoading, loadMore, refresh } =
    useReviewHistory();

  // Notion 연결 상태 확인
  useEffect(() => {
    async function checkNotion() {
      try {
        const res = await fetch("/api/notion/status");
        const data = await res.json();
        setNotionConfigured(data.configured);
        setNotionConnected(data.connected);
      } catch {
        setNotionConfigured(false);
        setNotionConnected(false);
      }
    }
    checkNotion();
  }, []);

  // Notion에 자동 저장
  const autoSaveToNotion = useCallback(
    async (fullReview: string) => {
      if (!notionConnected) {
        setSaveStatus("disabled");
        return;
      }

      setSaveStatus("saving");
      try {
        const res = await fetch("/api/notion/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language, review: fullReview }),
        });

        if (res.ok) {
          setSaveStatus("saved");
          refresh();
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    },
    [notionConnected, code, language, refresh],
  );

  const handleSubmit = async () => {
    setLoading(true);
    setReview("");
    setError("");
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "오류가 발생했습니다.");
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullReview = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullReview += chunk;
        setReview((prev) => prev + chunk);
      }

      // 스트리밍 완료 후 자동 저장
      autoSaveToNotion(fullReview);
    } catch {
      setError("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 히스토리 항목 선택 시 복원
  const handleHistorySelect = (entry: ReviewHistoryEntry) => {
    setCode(entry.code);
    setLanguage(entry.language);
    setReview(entry.review);
    setError("");
    setSaveStatus("idle");
    setViewMode("write");
  };

  // 히스토리 모드 전환 시 데이터 로드
  const handleViewHistory = () => {
    setViewMode("history");
    refresh();
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          AI 코드 리뷰어
        </h1>
        <div className="flex gap-2">
          {notionConfigured && notionConnected ? (
            <>
              {viewMode === "history" ? (
                <button
                  onClick={() => setViewMode("write")}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-zinc-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400"
                >
                  리뷰 작성
                </button>
              ) : (
                <button
                  onClick={handleViewHistory}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-zinc-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400"
                >
                  히스토리
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() =>
                setViewMode(viewMode === "guide" ? "write" : "guide")
              }
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-zinc-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400"
            >
              {viewMode === "guide" ? "돌아가기" : "Notion 연동"}
            </button>
          )}
        </div>
      </div>

      {viewMode === "guide" && (
        <div className="mb-6">
          <NotionSetupGuide onClose={() => setViewMode("write")} />
        </div>
      )}

      {viewMode === "history" && (
        <ReviewHistory
          entries={entries}
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={loadMore}
          onSelect={handleHistorySelect}
        />
      )}

      {viewMode === "write" && (
        <div className="flex flex-col gap-6">
          <CodeInput
            code={code}
            language={language}
            loading={loading}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
            onSubmit={handleSubmit}
          />
          {saveStatus !== "idle" && saveStatus !== "disabled" && (
            <SaveIndicator status={saveStatus} />
          )}
          <ReviewResult review={review} error={error} />
        </div>
      )}
    </div>
  );
}
