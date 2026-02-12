"use client";

import { useState } from "react";
import CodeInput from "@/components/CodeInput";
import ReviewResult from "@/components/ReviewResult";

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [review, setReview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setReview("");
    setError("");

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다.");
      } else {
        setReview(data.review);
      }
    } catch {
      setError("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        AI 코드 리뷰어
      </h1>
      <div className="flex flex-col gap-6">
        <CodeInput
          code={code}
          language={language}
          loading={loading}
          onCodeChange={setCode}
          onLanguageChange={setLanguage}
          onSubmit={handleSubmit}
        />
        <ReviewResult review={review} error={error} />
      </div>
    </div>
  );
}
