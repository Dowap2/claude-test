import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const { code, language } = await request.json();

  if (!code || !language) {
    return NextResponse.json(
      { error: "code와 language는 필수입니다." },
      { status: 400 },
    );
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `당신은 시니어 소프트웨어 엔지니어입니다. 아래 ${language} 코드를 리뷰해주세요.

다음 항목을 포함해서 한국어로 답변해주세요:
1. **전체 요약**: 코드가 하는 일을 간단히 설명
2. **잠재적 버그**: 버그나 오류가 될 수 있는 부분
3. **개선 제안**: 코드 품질, 가독성, 성능 개선점
4. **보안 이슈**: 보안 관련 문제가 있다면 지적
5. **점수**: 10점 만점으로 코드 품질 점수

\`\`\`${language}
${code}
\`\`\``,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const review = textBlock
      ? textBlock.text
      : "리뷰 결과를 생성할 수 없습니다.";

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "코드 리뷰 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
