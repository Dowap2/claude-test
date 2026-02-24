export interface SaveReviewRequest {
  code: string;
  language: string;
  review: string;
}

export interface SaveReviewResponse {
  success: boolean;
  pageId?: string;
  error?: string;
}

export interface ReviewHistoryEntry {
  id: string;
  title: string;
  code: string;
  language: string;
  review: string;
  score: number | null;
  createdAt: string;
}

export interface ReviewHistoryResponse {
  results: ReviewHistoryEntry[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface NotionStatusResponse {
  configured: boolean;
  connected: boolean;
  error?: string;
}
