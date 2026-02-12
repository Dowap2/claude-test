import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CodeInput from "./CodeInput";

const defaultProps = {
  code: "",
  language: "JavaScript",
  loading: false,
  onCodeChange: vi.fn(),
  onLanguageChange: vi.fn(),
  onSubmit: vi.fn(),
};

function renderCodeInput(overrides = {}) {
  const props = { ...defaultProps, ...overrides };
  return render(<CodeInput {...props} />);
}

describe("CodeInput", () => {
  it("textarea를 렌더링한다", () => {
    renderCodeInput();
    expect(
      screen.getByPlaceholderText("리뷰할 코드를 여기에 붙여넣으세요..."),
    ).toBeInTheDocument();
  });

  it("언어 선택 드롭다운에 4개 옵션이 있다", () => {
    renderCodeInput();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.textContent)).toEqual([
      "JavaScript",
      "TypeScript",
      "Python",
      "기타",
    ]);
  });

  it("코드 입력 시 onCodeChange가 호출된다", async () => {
    const onCodeChange = vi.fn();
    renderCodeInput({ onCodeChange });

    const textarea = screen.getByPlaceholderText(
      "리뷰할 코드를 여기에 붙여넣으세요...",
    );
    await userEvent.type(textarea, "a");

    expect(onCodeChange).toHaveBeenCalledWith("a");
  });

  it("언어 변경 시 onLanguageChange가 호출된다", async () => {
    const onLanguageChange = vi.fn();
    renderCodeInput({ onLanguageChange });

    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "Python");

    expect(onLanguageChange).toHaveBeenCalledWith("Python");
  });

  it("코드가 비어있으면 버튼이 비활성화된다", () => {
    renderCodeInput({ code: "" });
    expect(screen.getByRole("button", { name: "리뷰 요청" })).toBeDisabled();
  });

  it("공백만 있어도 버튼이 비활성화된다", () => {
    renderCodeInput({ code: "   " });
    expect(screen.getByRole("button", { name: "리뷰 요청" })).toBeDisabled();
  });

  it("코드가 있으면 버튼이 활성화된다", () => {
    renderCodeInput({ code: "const x = 1;" });
    expect(screen.getByRole("button", { name: "리뷰 요청" })).toBeEnabled();
  });

  it("버튼 클릭 시 onSubmit이 호출된다", async () => {
    const onSubmit = vi.fn();
    renderCodeInput({ code: "const x = 1;", onSubmit });

    await userEvent.click(screen.getByRole("button", { name: "리뷰 요청" }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("loading 중이면 버튼이 비활성화되고 텍스트가 변경된다", () => {
    renderCodeInput({ code: "const x = 1;", loading: true });
    const button = screen.getByRole("button", { name: "리뷰 중..." });
    expect(button).toBeDisabled();
  });
});
