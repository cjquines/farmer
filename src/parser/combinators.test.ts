import { describe, expect, it } from "vitest";
import { Parser, TokenStream } from "./combinators.js";
import { TokenType } from "./tokenizer.js";

describe("Parser combinators", () => {
  const name = Parser.token(TokenType.NAME);
  const number = Parser.token(TokenType.NUMBER);
  const operator = Parser.token(TokenType.OP);

  const literal = (value: string) =>
    new Parser((stream) =>
      stream.try((backtrack) => {
        const token = stream.next();
        if (token.type === TokenType.NAME && token.string === value) {
          return { success: true as const, value: token };
        }
        return backtrack();
      }),
    );

  it("backtracks when part of a sequence fails", () => {
    const nameThenNumber = name.then(number);
    const stream = new TokenStream("alpha beta");

    const result = nameThenNumber.parse(stream);

    expect(result.success).toBe(false);
    expect(stream.offset).toBe(0);
    expect(stream.peek()).toEqual({ type: TokenType.NAME, string: "alpha" });
  });

  it("falls back to alternatives without consuming the failed branch", () => {
    const numberOrName = number.or(name);
    const stream = new TokenStream("foo");

    const result = numberOrName.parse(stream);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({ type: TokenType.NAME, string: "foo" });
    }
    expect(stream.offset).toBe(1);
  });

  it("treats maybe() as a no-op when the parser fails", () => {
    const optionalNumber = number.maybe();
    const stream = new TokenStream("value");

    const result = optionalNumber.parse(stream);

    expect(result.success).toBe(true);
    expect(result.success && result.value).toBeNull();
    expect(stream.offset).toBe(0);
  });

  it("collects matches with many() until the first miss", () => {
    const stream = new TokenStream("1 2 foo");

    const result = number.many().parse(stream);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.map((token) => token.string)).toEqual(["1", "2"]);
    }
    expect(stream.offset).toBe(2);
    expect(stream.peek()).toEqual({ type: TokenType.NAME, string: "foo" });
  });

  it("requires at least one element for some()", () => {
    const stream = new TokenStream("foo");

    const result = number.some().parse(stream);

    expect(result.success).toBe(false);
    expect(stream.offset).toBe(0);
  });

  it("joins items with separators while discarding the separators", () => {
    const commaSeparatedNames = operator.join(name);
    const stream = new TokenStream("a,b,c");

    const result = commaSeparatedNames.parse(stream);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.map((token) => token.string)).toEqual([
        "a",
        "b",
        "c",
      ]);
    }
    expect(stream.offset).toBe(5);
    expect(stream.peek()).toEqual({ type: TokenType.ENDMARKER, string: "" });
  });

  it("looks ahead without consuming with with()", () => {
    const nameFollowedByComma = name.with(operator);
    const stream = new TokenStream("foo,");

    const result = nameFollowedByComma.parse(stream);

    expect(result.success).toBe(true);
    expect(stream.offset).toBe(1);
    const commaResult = operator.parse(stream);
    expect(commaResult.success).toBe(true);
    if (commaResult.success) {
      expect(commaResult.value).toEqual({ type: TokenType.OP, string: "," });
    }
  });

  it("rejects matches when without() lookahead succeeds", () => {
    const nameNotFollowedByComma = name.without(operator);
    const streamWithComma = new TokenStream("foo,");
    const streamWithoutComma = new TokenStream("foo bar");

    const commaResult = nameNotFollowedByComma.parse(streamWithComma);
    expect(commaResult.success).toBe(false);
    expect(streamWithComma.offset).toBe(0);

    const result = nameNotFollowedByComma.parse(streamWithoutComma);
    expect(result.success).toBe(true);
    expect(streamWithoutComma.offset).toBe(1);
  });

  it("commits to a branch and surfaces syntax errors instead of backtracking", () => {
    const committed = name.then(number).commit();
    const fallback = name;
    const parser = committed.or(fallback);
    const stream = new TokenStream("foo bar");

    expect(() => parser.parse(stream)).toThrow(/Syntax error/);
  });

  it("parses committed alternation a ~ b | c ~ d", () => {
    const parser = literal("a")
      .commit()
      .then(literal("b"))
      .or(literal("c").commit().then(literal("d")));

    expect(parser.parse("a b").success).toBe(true);

    expect(parser.parse("c d").success).toBe(true);

    expect(() => parser.parse("a d")).toThrow(/Syntax error/);
  });

  it("parses nested alternation a ~ (b c | d) | e (f ~ g | h) i | j", () => {
    const parser = literal("a")
      .commit()
      .then(literal("b").then(literal("c")).or(literal("d")))
      .or(
        literal("e")
          .then(literal("f").commit().then(literal("g")).or(literal("h")))
          .then(literal("i")),
      )
      .or(literal("j"));

    expect(parser.parse("a b c").success).toBe(true);

    expect(parser.parse("a d").success).toBe(true);

    expect(() => parser.parse("a b d")).toThrow(/Syntax error/);

    expect(() => parser.parse("a b")).toThrow(/Syntax error/);

    expect(() => parser.parse("a e")).toThrow(/Syntax error/);

    expect(parser.parse("e f g i").success).toBe(true);

    expect(() => parser.parse("e f i")).toThrow(/Syntax error/);

    expect(parser.parse("e h i").success).toBe(true);

    expect(parser.parse("j").success).toBe(true);
  });
});
