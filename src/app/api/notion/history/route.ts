import { NextRequest, NextResponse } from "next/server";
import { isNotionConfigured, fetchReviewHistory } from "@/lib/notion";
import type { ReviewHistoryResponse } from "@/types/review";

export async function GET(request: NextRequest) {
  if (!isNotionConfigured()) {
    return NextResponse.json<ReviewHistoryResponse>({
      results: [],
      hasMore: false,
      nextCursor: null,
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const pageSize = Math.min(
      Number(searchParams.get("pageSize") ?? 10),
      50,
    );

    const data = await fetchReviewHistory(cursor, pageSize);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Notion 히스토리 조회 오류:", error);
    return NextResponse.json(
      { results: [], hasMore: false, nextCursor: null, error: "히스토리 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
