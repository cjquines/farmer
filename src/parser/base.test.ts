import { describe, expect, it } from "vitest";
import { failure, Parser, ParseStream, success } from "./base.js";

describe("Parser combinators", () => {
  const from = (values: string | string[]) =>
    new ParseStream(Array.isArray(values) ? values : values.split(""));

  const lit = <const T extends string>(value: T) =>
    new Parser<string, T>((stream: ParseStream<string>) => {
      if (stream.peek() === value) {
        return success(stream.next() as T);
      } else {
        return failure();
      }
    });

  it("backtracks when part of a sequence fails", () => {
    const parser = lit("a").and(lit("b"));
    const stream = from("ac");
    const result = parser.parse(stream);

    expect(result.success).toBe(false);
    expect(stream.offset).toBe(0);
    expect(stream.peek()).toEqual("a");
  });

  it("falls back to alternatives without consuming the failed branch", () => {
    const parser = lit("a").or(lit("b"));
    const stream = from("b");
    const result = parser.parse(stream);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual("b");
    }
    expect(stream.offset).toBe(1);
  });

  it("treats maybe() as a no-op when the parser fails", () => {
    const parser = lit("a").maybe();
    const stream = from("b");
    const result = parser.parse(stream);

    expect(result.success).toBe(true);
    expect(result.success && result.value).toBeNull();
    expect(stream.offset).toBe(0);
  });

  it("collects matches with many() until the first miss", () => {
    const parser = lit("a").many();
    const stream = from("aab");
    const result = parser.parse(stream);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual(["a", "a"]);
    }
    expect(stream.offset).toBe(2);
    expect(stream.peek()).toEqual("b");
  });

  it("requires at least one element for some()", () => {
    const parser = lit("a").some();
    const stream = from("b");
    const result = parser.parse(stream);

    expect(result.success).toBe(false);
    expect(stream.offset).toBe(0);
  });

  it("joins items with separators while discarding the separators", () => {
    const parser = lit(",").join(lit("a"));
    const stream = from("a,a,b");
    const result = parser.parse(stream);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual(["a", "a"]);
    }
    expect(stream.offset).toBe(3);
    expect(stream.peek()).toEqual(",");
  });

  it("looks ahead without consuming with with()", () => {
    const parser = lit("a").with(lit("b"));
    const stream = from("ab");
    const result1 = parser.parse(stream);

    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.value).toEqual("a");
    }
    expect(stream.offset).toBe(1);

    const result2 = lit("b").parse(stream);

    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.value).toEqual("b");
    }
    expect(stream.offset).toBe(2);
  });

  it("rejects matches when without() lookahead succeeds", () => {
    const parser = lit("a").without(lit("b"));
    const stream1 = from("ab");
    const stream2 = from("ac");

    const result1 = parser.parse(stream1);
    expect(result1.success).toBe(false);
    expect(stream1.offset).toBe(0);

    const result2 = parser.parse(stream2);
    expect(result2.success).toBe(true);
    expect(stream2.offset).toBe(1);
  });

  it("commits to a branch and surfaces syntax errors instead of backtracking", () => {
    const parser = lit("a").commit().and(lit("b")).or(lit("a"));
    const stream = from("ac");

    expect(() => parser.parse(stream)).toThrow(/Syntax error/);
  });

  it("parses committed alternation a ~ b | c ~ d", () => {
    const parser = Parser.or(
      lit("a").commit().and(lit("b")),
      lit("c").commit().and(lit("d")),
    );

    expect(parser.parse(from("ab")).success).toBe(true);
    expect(parser.parse(from("cd")).success).toBe(true);
    expect(() => parser.parse(from("ad"))).toThrow(/Syntax error/);
  });

  it("parses nested alternation a ~ (b c | d) | e (f ~ g | h) i | j", () => {
    const parser = Parser.or(
      Parser.and(
        lit("a").commit(),
        Parser.or(
          lit("b").and(lit("c")), //
          lit("d"),
        ),
      ),
      Parser.and(
        lit("e"),
        Parser.or(
          lit("f").commit().and(lit("g")), //
          lit("h"),
        ),
        lit("i"),
      ),
      lit("j"),
    );

    expect(parser.parse(from("abc")).success).toBe(true);
    expect(parser.parse(from("ad")).success).toBe(true);
    expect(() => parser.parse(from("abd"))).toThrow(/Syntax error/);
    expect(() => parser.parse(from("ab"))).toThrow(/Syntax error/);
    expect(() => parser.parse(from("ae"))).toThrow(/Syntax error/);
    expect(parser.parse(from("efgi")).success).toBe(true);
    expect(() => parser.parse(from("efi"))).toThrow(/Syntax error/);
    expect(parser.parse(from("ehi")).success).toBe(true);
    expect(parser.parse(from("j")).success).toBe(true);
  });
});
