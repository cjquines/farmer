import { describe, expect, it } from "vitest";
import { dedent, indent, wrap } from "./util.js";

describe("printer util helpers", () => {
  it("indents every line", () => {
    expect(indent("line\nnext", 2)).toBe("  line\n  next");
  });

  it("wraps text while preserving the current line contents", () => {
    expect(wrap("wrap words together", 12)).toBe(
      dedent`
        wrap words
        together
      `,
    );
    expect(wrap("one\ntwo three", 10)).toBe(
      dedent`
        one two
        three
      `,
    );
  });
});
