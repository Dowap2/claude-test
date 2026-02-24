"use client";

import { useState } from "react";

interface NotionSetupGuideProps {
  onClose: () => void;
}

export default function NotionSetupGuide({ onClose }: NotionSetupGuideProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "1. Notion Integration 생성",
      content:
        "notion.so/my-integrations에서 새 Integration을 만드세요. 이름을 입력하고 'Submit' 버튼을 클릭합니다.",
    },
    {
      title: "2. API 키 복사",
      content:
        "생성된 Integration의 'Internal Integration Secret'을 복사합니다. 이 값이 NOTION_API_KEY입니다.",
    },
    {
      title: "3. 데이터베이스 생성",
      content:
        'Notion에서 새 데이터베이스를 만들고 다음 속성을 추가하세요: "제목"(title), "코드"(rich_text), "언어"(select), "리뷰결과"(rich_text), "점수"(number).',
    },
    {
      title: "4. Integration 연결",
      content:
        '데이터베이스 페이지 우측 상단 "..." → "Connect to" → 생성한 Integration을 선택합니다.',
    },
    {
      title: "5. 환경 변수 설정",
      content:
        ".env.local 파일에 다음을 추가하세요:\nNOTION_API_KEY=secret_xxx\nNOTION_DATABASE_ID=xxx\n\n데이터베이스 ID는 데이터베이스 URL에서 확인할 수 있습니다.",
    },
  ];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Notion 연동 설정 가이드
        </h3>
        <button
          onClick={onClose}
          className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          닫기
        </button>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step
                  ? "bg-zinc-900 dark:bg-zinc-100"
                  : "bg-zinc-200 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
          {steps[step].title}
        </h4>
        <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
          {steps[step].content}
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-md px-4 py-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          이전
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            다음
          </button>
        ) : (
          <button
            onClick={onClose}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            완료
          </button>
        )}
      </div>
    </div>
  );
}
