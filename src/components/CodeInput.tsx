"use client";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "기타"] as const;

interface CodeInputProps {
  code: string;
  language: string;
  loading: boolean;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  onSubmit: () => void;
}

export default function CodeInput({
  code,
  language,
  loading,
  onCodeChange,
  onLanguageChange,
  onSubmit,
}: CodeInputProps) {
  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="h-64 w-full resize-y rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
        placeholder="리뷰할 코드를 여기에 붙여넣으세요..."
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <select
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <button
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          onClick={onSubmit}
          disabled={loading || !code.trim()}
        >
          {loading ? "리뷰 중..." : "리뷰 요청"}
        </button>
      </div>
    </div>
  );
}
