import { Client } from "@notionhq/client";
import type {
  SaveReviewRequest,
  ReviewHistoryEntry,
  ReviewHistoryResponse,
} from "@/types/review";

let notionClient: Client | null = null;

/** 환경변수 설정 여부 확인 */
export function isNotionConfigured(): boolean {
  return !!(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID);
}

/** 싱글턴 Notion 클라이언트 반환 */
export function getNotionClient(): Client {
  if (!notionClient) {
    notionClient = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return notionClient;
}

/** 리뷰 텍스트에서 "N/10" 점수 추출 */
export function extractScore(review: string): number | null {
  // "7/10", "8.5/10" 등의 패턴 매칭
  const match = review.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  if (!match) return null;
  const score = parseFloat(match[1]);
  return score >= 0 && score <= 10 ? score : null;
}

/** 긴 텍스트를 maxLength 이하 청크로 분할 */
export function chunkText(text: string, maxLength = 2000): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }
    // 줄바꿈 기준으로 자르기 시도
    let cutIndex = remaining.lastIndexOf("\n", maxLength);
    if (cutIndex <= 0) {
      cutIndex = maxLength;
    }
    chunks.push(remaining.slice(0, cutIndex));
    remaining = remaining.slice(cutIndex);
  }

  return chunks;
}

/** Notion 데이터베이스에 리뷰 저장 */
export async function saveReviewToNotion(
  data: SaveReviewRequest,
): Promise<string> {
  const client = getNotionClient();
  const databaseId = process.env.NOTION_DATABASE_ID!;

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const title = `${data.language} 코드 리뷰 - ${dateStr}`;

  const score = extractScore(data.review);

  // rich_text 2000자 제한 처리
  const codeChunks = chunkText(data.code);
  const reviewChunks = chunkText(data.review);

  const response = await client.pages.create({
    parent: { database_id: databaseId },
    properties: {
      제목: {
        title: [{ text: { content: title } }],
      },
      코드: {
        rich_text: codeChunks.map((chunk) => ({ text: { content: chunk } })),
      },
      언어: {
        select: { name: data.language },
      },
      리뷰결과: {
        rich_text: reviewChunks.map((chunk) => ({
          text: { content: chunk },
        })),
      },
      ...(score !== null && {
        점수: { number: score },
      }),
    },
  });

  return response.id;
}

/** 히스토리 조회 (페이지네이션) */
export async function fetchReviewHistory(
  cursor?: string,
  pageSize = 10,
): Promise<ReviewHistoryResponse> {
  const client = getNotionClient();
  const databaseId = process.env.NOTION_DATABASE_ID!;

  const response = await client.dataSources.query({
    data_source_id: databaseId,
    sorts: [{ timestamp: "created_time", direction: "descending" }],
    page_size: pageSize,
    ...(cursor && { start_cursor: cursor }),
  });

  const results: ReviewHistoryEntry[] = response.results.map((page) => {
    // Notion API 타입이 복잡하므로 안전하게 추출
    const props = (page as Record<string, unknown>)["properties"] as Record<
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >;

    const titleProp = props["제목"]?.title?.[0]?.text?.content ?? "";
    const codeParts: string[] =
      props["코드"]?.rich_text?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rt: any) => rt.text?.content ?? "",
      ) ?? [];
    const reviewParts: string[] =
      props["리뷰결과"]?.rich_text?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rt: any) => rt.text?.content ?? "",
      ) ?? [];
    const language = props["언어"]?.select?.name ?? "";
    const score = props["점수"]?.number ?? null;
    const createdAt =
      (page as Record<string, unknown>)["created_time"] as string;

    return {
      id: page.id,
      title: titleProp,
      code: codeParts.join(""),
      language,
      review: reviewParts.join(""),
      score,
      createdAt,
    };
  });

  return {
    results,
    hasMore: response.has_more,
    nextCursor: response.next_cursor,
  };
}

/** Notion 연결 상태 확인 */
export async function checkNotionConnection(): Promise<boolean> {
  try {
    const client = getNotionClient();
    const databaseId = process.env.NOTION_DATABASE_ID!;
    await client.databases.retrieve({ database_id: databaseId });
    return true;
  } catch {
    return false;
  }
}
