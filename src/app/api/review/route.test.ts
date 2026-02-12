import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

vi.mock("@anthropic-ai/sdk", () => {
  const MockAnthropic = function () {
    return { messages: { create: mockCreate } };
  };
  return { default: MockAnthropic };
});

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/review", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("code가 없으면 400을 반환한다", async () => {
    const res = await POST(makeRequest({ language: "JavaScript" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("code와 language는 필수입니다.");
  });

  it("language가 없으면 400을 반환한다", async () => {
    const res = await POST(makeRequest({ code: "const x = 1;" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("code와 language는 필수입니다.");
  });

  it("정상 요청 시 리뷰 결과를 반환한다", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "좋은 코드입니다." }],
    });

    const res = await POST(
      makeRequest({ code: "const x = 1;", language: "JavaScript" }),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.review).toBe("좋은 코드입니다.");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
      }),
    );
  });

  it("Claude API 오류 시 500을 반환한다", async () => {
    mockCreate.mockRejectedValue(new Error("API 장애"));

    const res = await POST(
      makeRequest({ code: "const x = 1;", language: "JavaScript" }),
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("코드 리뷰 중 오류가 발생했습니다.");
  });

  it("text 블록이 없으면 기본 메시지를 반환한다", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "tool_use", id: "1", name: "test", input: {} }],
    });

    const res = await POST(
      makeRequest({ code: "const x = 1;", language: "JavaScript" }),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.review).toBe("리뷰 결과를 생성할 수 없습니다.");
  });
});
