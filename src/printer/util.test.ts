import { describe, expect, it } from "vitest";
import { Indent, Wrap } from "./util.js";

describe("printer util helpers", () => {
  it("indents every line", () => {
    expect(Indent("line\nnext", 2)).toMatchInlineSnapshot(`
      "  line
        next"
    `);
  });

  it("wraps text while preserving the current line contents", () => {
    expect(Wrap("wrap words together", 12)).toMatchInlineSnapshot(`
      " wrap words
      together"
    `);
    expect(Wrap("one\ntwo three", 10)).toMatchInlineSnapshot(`
      " one two
      three"
    `);
  });
});
