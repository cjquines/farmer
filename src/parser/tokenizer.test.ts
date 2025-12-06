import { describe, expect, it } from "vitest";
import { TokenType, tokenize } from "./tokenizer.js";

describe("tokenize", () => {
  it("tokenizes names, numbers, and operators while ignoring whitespace", () => {
    const tokens = tokenize("foo = 123\nbar+baz");

    expect(tokens).toEqual([
      { type: TokenType.NAME, string: "foo" },
      { type: TokenType.OP, string: "=" },
      { type: TokenType.NUMBER, string: "123" },
      { type: TokenType.NAME, string: "bar" },
      { type: TokenType.OP, string: "+" },
      { type: TokenType.NAME, string: "baz" },
      { type: TokenType.ENDMARKER, string: "" },
    ]);
  });

  it("emits comments and resumes tokenizing after newlines", () => {
    const tokens = tokenize("# hi there\nvalue");

    expect(tokens).toEqual([
      { type: TokenType.COMMENT, string: "# hi there" },
      { type: TokenType.NAME, string: "value" },
      { type: TokenType.ENDMARKER, string: "" },
    ]);
  });

  it("extracts string contents for single and triple quoted strings", () => {
    const tokens = tokenize('\'hi\' """multi\nline"""');

    expect(tokens).toEqual([
      { type: TokenType.STRING, string: "hi" },
      { type: TokenType.STRING, string: "multi\nline" },
      { type: TokenType.ENDMARKER, string: "" },
    ]);
  });

  it("groups contiguous operator characters into a single token", () => {
    const tokens = tokenize("a>>=b==c");

    expect(tokens).toEqual([
      { type: TokenType.NAME, string: "a" },
      { type: TokenType.OP, string: ">>=" },
      { type: TokenType.NAME, string: "b" },
      { type: TokenType.OP, string: "==" },
      { type: TokenType.NAME, string: "c" },
      { type: TokenType.ENDMARKER, string: "" },
    ]);
  });

  it("still yields an endmarker for empty input", () => {
    const tokens = tokenize("");

    expect(tokens).toEqual([{ type: TokenType.ENDMARKER, string: "" }]);
  });
});
