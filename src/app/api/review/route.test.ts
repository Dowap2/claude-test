import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { EventEmitter } from "events";

const { mockStream } = vi.hoisted(() => ({
  mockStream: vi.fn(),
}));

vi.mock("@anthropic-ai/sdk", () => {
  const MockAnthropic = function () {
    return { messages: { stream: mockStream } };
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

function createMockEmitter(chunks: string[]) {
  const emitter = new EventEmitter();
  setTimeout(() => {
    for (const chunk of chunks) {
      emitter.emit("text", chunk);
    }
    emitter.emit("end");
  }, 0);
  return emitter;
}

async function readStream(response: Response): Promise<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  return result;
}

describe("POST /api/review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 기본적으로 API 키가 있는 상태로 설정
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
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

  it("정상 요청 시 스트리밍 응답을 반환한다", async () => {
    mockStream.mockReturnValue(createMockEmitter(["좋은 ", "코드입니다."]));

    const res = await POST(
      makeRequest({ code: "const x = 1;", language: "JavaScript" }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");

    const text = await readStream(res);
    expect(text).toBe("좋은 코드입니다.");
    expect(mockStream).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
      }),
    );
  });

  it("여러 청크가 순서대로 전달된다", async () => {
    mockStream.mockReturnValue(
      createMockEmitter(["1. ", "요약\n", "2. ", "버그"]),
    );

    const res = await POST(
      makeRequest({ code: "x = 1", language: "Python" }),
    );
    const text = await readStream(res);

    expect(text).toBe("1. 요약\n2. 버그");
  });

  it("Claude API 오류 시 500을 반환한다", async () => {
    mockStream.mockImplementation(() => {
      throw new Error("API 장애");
    });

    const res = await POST(
      makeRequest({ code: "const x = 1;", language: "JavaScript" }),
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("코드 리뷰 중 오류가 발생했습니다.");
  });

  describe("데모 모드 (API 키 없음)", () => {
    beforeEach(() => {
      vi.stubEnv("ANTHROPIC_API_KEY", "");
    });

    it("API 키가 없으면 데모 리뷰를 반환한다", async () => {
      const res = await POST(
        makeRequest({ code: "const x = 1;", language: "JavaScript" }),
      );

      expect(res.status).toBe(200);
      const text = await readStream(res);

      expect(text).toContain("데모 모드");
      expect(text).toContain("ANTHROPIC_API_KEY");
      expect(text).toContain("JavaScript");
      expect(mockStream).not.toHaveBeenCalled();
    });

    it("데모 리뷰에 코드 줄 수가 포함된다", async () => {
      const code = "line1\nline2\nline3";
      const res = await POST(makeRequest({ code, language: "Python" }));
      const text = await readStream(res);

      expect(text).toContain("3줄");
    });
  });
});
