import type { Token } from "./tokenizer.js";
import { tokenize, TokenType } from "./tokenizer.js";
import type { ParseResult } from "./base.js";
import { Parser as BaseParser, ParseStream, failure, success } from "./base.js";

export class TokenStream extends ParseStream<Token> {
  constructor(content: string) {
    super(tokenize(content));
  }
}

export class Parser<T> extends BaseParser<Token, T> {
  parse(content: string): ParseResult<T>;
  parse(content: Token[]): ParseResult<T>;
  parse(stream: ParseStream<Token>): ParseResult<T>;
  parse(input: string | Token[] | ParseStream<Token>): ParseResult<T>;
  parse(input: string | Token[] | ParseStream<Token>): ParseResult<T> {
    return super.parse(typeof input === "string" ? tokenize(input) : input);
  }

  /** Match a specific token type, possibly with a specific value. */
  static token<const Type extends TokenType>(
    type: Type,
    value?: string,
  ): Parser<Token<Type>> {
    return new Parser<Token<Type>>((stream) => {
      if (stream.done()) {
        return failure();
      }
      return stream.try((backtrack) => {
        const token = stream.next();
        if (token.type === type && (!value || token.string === value)) {
          return success(token as Token<Type>);
        }
        return backtrack();
      });
    });
  }

  static comment = () => Parser.token(TokenType.COMMENT);

  static eof = () => Parser.token(TokenType.ENDMARKER);

  static number = (value?: string) =>
    Parser.token(TokenType.NUMBER, value).map((t) => parseInt(t.string));

  static name = (value?: string) =>
    Parser.token(TokenType.NAME, value).map((t) => t.string);

  static op = (value?: string) =>
    Parser.token(TokenType.OP, value).map((t) => t.string);

  static string = (value?: string) =>
    Parser.token(TokenType.STRING, value).map((t) => t.string);

  static constant = () =>
    Parser.or(
      Parser.name("None").map(() => null),
      Parser.name("True").map(() => true),
      Parser.name("False").map(() => false),
      Parser.number(),
      Parser.string(),
    );
}
