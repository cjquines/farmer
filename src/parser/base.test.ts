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

  it("maps a parser", () => {
    const result = lit("a")
      .map((a) => a.toUpperCase())
      .parseStream(from("a"));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual("A");
    }
  });

  it("combines objects", () => {
    const result = Parser.and(
      lit("a").as("a"),
      lit("b").drop(),
      lit("c").as("c"),
      lit("d").as("d"),
    ).parseStream(from("abcd"));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({ a: "a", c: "c", d: "d" });
    }
  });

  it("works with predicates", () => {
    const parser = lit("a")
      .or(lit("b"))
      .if((a) => a === "a");
    const result1 = parser.parseStream(from("a"));
    const result2 = parser.parseStream(from("b"));

    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.value).toEqual("a");
    }
    expect(result2.success).toBe(false);
  });

  it("falls back to alternatives without consuming the failed branch", () => {
    const parser = lit("a").or(lit("b"));
    const stream = from("b");
    const result = parser.parseStream(stream);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual("b");
    }
    expect(stream.offset).toBe(1);
  });

  it("backtracks when part of a sequence fails", () => {
    const parser = lit("a").and(lit("b"));
    const stream = from("ac");
    const result = parser.parseStream(stream);

    expect(result.success).toBe(false);
    expect(stream.offset).toBe(0);
    expect(stream.peek()).toEqual("a");
  });

  it("treats maybe() as a no-op when the parser fails", () => {
    const parser = lit("a").maybe();
    const stream = from("b");
    const result = parser.parseStream(stream);

    expect(result.success).toBe(true);
    expect(result.success && result.value).toBeNull();
    expect(stream.offset).toBe(0);
  });

  it("collects matches with many() until the first miss", () => {
    const parser = lit("a").many();
    const stream = from("aab");
    const result = parser.parseStream(stream);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual(["a", "a"]);
    }
    expect(stream.offset).toBe(2);
    expect(stream.peek()).toEqual("b");
  });

  it("backtracks when many() parser fails after consuming input", () => {
    const consumingFailure = new Parser<string, string>((stream) => {
      if (stream.peek() === "a") {
        stream.next();
        return failure(true);
      }
      return failure();
    });

    const parser = consumingFailure.many();
    const stream = from("abc");
    const result = parser.parseStream(stream);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual([]);
    }
    expect(stream.offset).toBe(0);
    expect(stream.peek()).toEqual("a");
  });

  it("requires at least one element for some()", () => {
    const parser = lit("a").some();
    const stream = from("b");
    const result = parser.parseStream(stream);

    expect(result.success).toBe(false);
    expect(stream.offset).toBe(0);
  });

  it("joins items with separators while discarding the separators", () => {
    const parser = lit(",").join(lit("a"));
    const stream = from("a,a,b");
    const result = parser.parseStream(stream);

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
    const result1 = parser.parseStream(stream);

    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.value).toEqual("a");
    }
    expect(stream.offset).toBe(1);

    const result2 = lit("b").parseStream(stream);

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

    const result1 = parser.parseStream(stream1);
    expect(result1.success).toBe(false);
    expect(stream1.offset).toBe(0);

    const result2 = parser.parseStream(stream2);
    expect(result2.success).toBe(true);
    expect(stream2.offset).toBe(1);
  });

  it("commits to a branch and surfaces syntax errors instead of backtracking", () => {
    const parser = lit("a").commit().and(lit("b")).or(lit("a"));
    const stream = from("ac");

    expect(() => parser.parseStream(stream)).toThrow(/Syntax error/);
  });

  it("parses committed alternation a ~ b | c ~ d", () => {
    const parser = Parser.or(
      lit("a").commit().and(lit("b")),
      lit("c").commit().and(lit("d")),
    );

    expect(parser.parseStream(from("ab")).success).toBe(true);
    expect(parser.parseStream(from("cd")).success).toBe(true);
    expect(() => parser.parseStream(from("ad"))).toThrow(/Syntax error/);
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

    expect(parser.parseStream(from("abc")).success).toBe(true);
    expect(parser.parseStream(from("ad")).success).toBe(true);
    expect(() => parser.parseStream(from("abd"))).toThrow(/Syntax error/);
    expect(() => parser.parseStream(from("ab"))).toThrow(/Syntax error/);
    expect(() => parser.parseStream(from("ae"))).toThrow(/Syntax error/);
    expect(parser.parseStream(from("efgi")).success).toBe(true);
    expect(() => parser.parseStream(from("efi"))).toThrow(/Syntax error/);
    expect(parser.parseStream(from("ehi")).success).toBe(true);
    expect(parser.parseStream(from("j")).success).toBe(true);
  });
});
