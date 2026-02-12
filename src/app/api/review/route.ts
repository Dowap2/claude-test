import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const PROMPT_TEMPLATE = (language: string, code: string) =>
  `당신은 시니어 소프트웨어 엔지니어입니다. 아래 ${language} 코드를 리뷰해주세요.

다음 항목을 포함해서 한국어로 답변해주세요:
1. **전체 요약**: 코드가 하는 일을 간단히 설명
2. **잠재적 버그**: 버그나 오류가 될 수 있는 부분
3. **개선 제안**: 코드 품질, 가독성, 성능 개선점
4. **보안 이슈**: 보안 관련 문제가 있다면 지적
5. **점수**: 10점 만점으로 코드 품질 점수

\`\`\`${language}
${code}
\`\`\``;

// API 키가 없으면 데모 리뷰를 스트리밍으로 반환
function createDemoResponse(language: string, code: string) {
  const lines = code.trim().split("\n");
  const demoReview = `⚠️ **데모 모드** - ANTHROPIC_API_KEY가 설정되지 않아 샘플 리뷰를 표시합니다.

---

1. **전체 요약**
입력된 ${language} 코드는 총 ${lines.length}줄로 구성되어 있습니다.
실제 AI 리뷰를 받으려면 .env.local 파일에 ANTHROPIC_API_KEY를 설정해주세요.

2. **잠재적 버그**
데모 모드에서는 실제 코드 분석이 수행되지 않습니다.

3. **개선 제안**
데모 모드에서는 실제 코드 분석이 수행되지 않습니다.

4. **보안 이슈**
데모 모드에서는 실제 코드 분석이 수행되지 않습니다.

5. **점수**: -/10 (데모 모드)`;

  const encoder = new TextEncoder();
  const chunks = demoReview.split(/(?<=\n)/);
  let index = 0;

  const readable = new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: NextRequest) {
  const { code, language } = await request.json();

  if (!code || !language) {
    return NextResponse.json(
      { error: "code와 language는 필수입니다." },
      { status: 400 },
    );
  }

  // API 키가 없으면 데모 모드로 동작
  if (!process.env.ANTHROPIC_API_KEY) {
    return createDemoResponse(language, code);
  }

  try {
    const client = new Anthropic();
    const stream = client.messages.stream({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      messages: [{ role: "user", content: PROMPT_TEMPLATE(language, code) }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        stream.on("text", (text) => {
          controller.enqueue(encoder.encode(text));
        });
        stream.on("error", (error) => {
          console.error("Claude API stream error:", error);
          controller.error(error);
        });
        stream.on("end", () => {
          controller.close();
        });
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "코드 리뷰 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
