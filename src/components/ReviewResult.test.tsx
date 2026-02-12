import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ReviewResult from "./ReviewResult";

describe("ReviewResult", () => {
  it("review와 error가 모두 비어있으면 아무것도 렌더링하지 않는다", () => {
    const { container } = render(<ReviewResult review="" error="" />);
    expect(container.firstChild).toBeNull();
  });

  it("review가 있으면 리뷰 결과를 표시한다", () => {
    render(<ReviewResult review="코드가 잘 작성되었습니다." error="" />);

    expect(screen.getByText("리뷰 결과")).toBeInTheDocument();
    expect(screen.getByText("코드가 잘 작성되었습니다.")).toBeInTheDocument();
  });

  it("error가 있으면 에러 메시지를 표시한다", () => {
    render(<ReviewResult review="" error="API 오류가 발생했습니다." />);

    expect(screen.getByText("API 오류가 발생했습니다.")).toBeInTheDocument();
    expect(screen.queryByText("리뷰 결과")).not.toBeInTheDocument();
  });

  it("error와 review가 동시에 있으면 error만 표시한다", () => {
    render(
      <ReviewResult review="좋은 코드입니다." error="오류 발생" />,
    );

    expect(screen.getByText("오류 발생")).toBeInTheDocument();
    expect(screen.queryByText("좋은 코드입니다.")).not.toBeInTheDocument();
  });
});
