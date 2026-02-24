import { NextResponse } from "next/server";
import {
  isNotionConfigured,
  checkNotionConnection,
} from "@/lib/notion";
import type { NotionStatusResponse } from "@/types/review";

export async function GET() {
  if (!isNotionConfigured()) {
    return NextResponse.json<NotionStatusResponse>({
      configured: false,
      connected: false,
    });
  }

  try {
    const connected = await checkNotionConnection();
    return NextResponse.json<NotionStatusResponse>({
      configured: true,
      connected,
      ...(!connected && { error: "데이터베이스 연결에 실패했습니다." }),
    });
  } catch {
    return NextResponse.json<NotionStatusResponse>({
      configured: true,
      connected: false,
      error: "Notion 연결 확인 중 오류가 발생했습니다.",
    });
  }
}
