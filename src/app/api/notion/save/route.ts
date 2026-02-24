import { NextRequest, NextResponse } from "next/server";
import { isNotionConfigured, saveReviewToNotion } from "@/lib/notion";
import type { SaveReviewRequest, SaveReviewResponse } from "@/types/review";

export async function POST(request: NextRequest) {
  if (!isNotionConfigured()) {
    return NextResponse.json<SaveReviewResponse>(
      { success: false, error: "Notion이 설정되지 않았습니다." },
      { status: 400 },
    );
  }

  try {
    const body = (await request.json()) as SaveReviewRequest;

    if (!body.code || !body.language || !body.review) {
      return NextResponse.json<SaveReviewResponse>(
        { success: false, error: "code, language, review는 필수입니다." },
        { status: 400 },
      );
    }

    const pageId = await saveReviewToNotion(body);
    return NextResponse.json<SaveReviewResponse>({
      success: true,
      pageId,
    });
  } catch (error) {
    console.error("Notion 저장 오류:", error);
    return NextResponse.json<SaveReviewResponse>(
      { success: false, error: "Notion에 저장하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
