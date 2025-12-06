import type { Token } from "./tokenizer.js";
import { tokenize, TokenType } from "./tokenizer.js";

type ParseResult<T> =
  | {
      success: true;
      value: T;
    }
  | {
      success: false;
      /** Whether this parser matched any input before failing. */
      matched: boolean;
    };

function success<T>(value: T): ParseResult<T> {
  return { success: true, value };
}

function failure<T>(matched = false): ParseResult<T> {
  return { success: false, matched };
}

export class TokenStream {
  tokens: Token[];
  offset: number;
  eager: boolean;

  constructor(content: string) {
    this.tokens = tokenize(content);
    this.offset = 0;
    this.eager = false;
  }

  error(): never {
    throw new Error(`Syntax error at ${this.offset} = ${this.peek()}`);
  }

  peek(): Token {
    return this.tokens[this.offset]!;
  }

  next(): Token {
    const token = this.tokens[this.offset]!;
    this.offset += 1;
    return token;
  }

  seek(index: number) {
    this.offset = index;
  }

  done(): boolean {
    return this.peek().type === TokenType.ENDMARKER;
  }

  try<T>(
    fn: (backtrack: (matched?: boolean) => ParseResult<T>) => ParseResult<T>,
  ): ParseResult<T> {
    const offset = this.offset;
    const backtrack = (matched = false) => {
      if (this.eager && matched) {
        this.error();
      }
      this.offset = offset;
      return failure<T>(matched);
    };
    return fn(backtrack);
  }
}

type Concat<T, U> = U extends T[]
  ? // This is a common enough special case:
    [T, ...U]
  : T extends [...infer Ts]
    ? U extends [...infer Us]
      ? [...Ts, ...Us]
      : U extends (infer Us)[]
        ? [...Ts, ...Us[]]
        : [...Ts, U]
    : T extends (infer Ts)[]
      ? U extends [...infer Us]
        ? [...Ts[], ...Us]
        : U extends (infer Us)[]
          ? // A rest element cannot be followed by another rest element, so
            // this is the best type:
            (Ts | Us)[]
          : [...Ts[], U]
      : U extends [...infer Us]
        ? [T, ...Us]
        : U extends (infer Us)[]
          ? [T, ...Us[]]
          : [T, U];

function concat<T, U>(a: T, b: U): Concat<T, U>;
function concat<T, U>(a: T, b: U) {
  return Array.isArray(a)
    ? Array.isArray(b)
      ? [...a, ...b]
      : [...a, b]
    : Array.isArray(b)
      ? [a, ...b]
      : [a, b];
}

export class Parser<T> {
  parseStream: (stream: TokenStream) => ParseResult<T>;

  constructor(parseStream: (stream: TokenStream) => ParseResult<T>) {
    this.parseStream = parseStream;
  }

  parse(content: string): ParseResult<T>;
  parse(stream: TokenStream): ParseResult<T>;
  parse(input: string | TokenStream): ParseResult<T> {
    return this.parseStream(
      typeof input === "string" ? new TokenStream(input) : input,
    );
  }

  /** Match a specific token type. */
  static token<const Type extends TokenType>(type: Type): Parser<Token<Type>> {
    return new Parser<Token<Type>>((stream) => {
      if (stream.done()) {
        return failure();
      }
      return stream.try((backtrack) => {
        const token = stream.next();
        if (token.type === type) {
          return success(token as Token<Type>);
        }
        return backtrack();
      });
    });
  }

  /**
   * Match `this` or `other`, whichever succeeds first.
   *
   * Python PEG: `this | other`
   */
  or<U>(other: Parser<U>): Parser<T | U> {
    return new Parser<T | U>((stream) => {
      const result = this.parse(stream);
      if (result.success) {
        return result;
      }
      return other.parse(stream);
    });
  }

  /**
   * Match `this` followed by `other`.
   *
   * Python PEG: `this other`
   */
  then<U>(other: Parser<U>): Parser<Concat<T, U>> {
    return new Parser<Concat<T, U>>((stream) => {
      return stream.try((backtrack) => {
        const resultT = this.parse(stream);
        if (!resultT.success) {
          return backtrack(resultT.matched);
        }
        const resultU = other.parse(stream);
        if (!resultU.success) {
          return backtrack(true);
        }
        return success(concat(resultT.value, resultU.value));
      });
    });
  }

  /** Match `this` followed by `other`, but drop `this`. */
  ignoreThen<U>(other: Parser<U>): Parser<U> {
    return new Parser<U>((stream) => {
      return stream.try((backtrack) => {
        const resultT = this.parse(stream);
        if (!resultT.success) {
          return backtrack(resultT.matched);
        }
        const resultU = other.parse(stream);
        if (!resultU.success) {
          return backtrack(true);
        }
        return success(resultU.value);
      });
    });
  }

  /** Match `this` followed by `other`, but drop `other`. */
  thenIgnore<U>(other: Parser<U>): Parser<T> {
    return new Parser<T>((stream) => {
      return stream.try((backtrack) => {
        const resultT = this.parse(stream);
        if (!resultT.success) {
          return backtrack(resultT.matched);
        }
        const resultU = other.parse(stream);
        if (!resultU.success) {
          return backtrack(true);
        }
        return success(resultT.value);
      });
    });
  }

  /**
   * Optionally match `this`.
   *
   * Python PEG: `[ this ]` or `this?`
   */
  maybe(): Parser<T | null> {
    return new Parser<T | null>((stream) => {
      const result = this.parse(stream);
      if (result.success) {
        return result;
      }
      return success(null);
    });
  }

  /**
   * Match zero or more occurrences of `this`.
   *
   * Python PEG: `this*`
   */
  many(): Parser<T[]> {
    return new Parser<T[]>((stream) => {
      const results: T[] = [];
      while (true) {
        const result = this.parse(stream);
        if (!result.success) {
          break;
        }
        results.push(result.value);
      }
      return success(results);
    });
  }

  /**
   * Match one or more occurrences of `this`.
   *
   * Python PEG: `this+`
   */
  some(): Parser<[T, ...T[]]> {
    return this.then(this.many());
  }

  /**
   * Match one or more occurrences of `other`, separated by `this`. The
   * result does not include `this`.
   *
   * Python PEG: `this.other+`
   */
  join<U>(other: Parser<U>): Parser<[U, ...U[]]> {
    return other.then(this.ignoreThen(other).many());
  }

  /**
   * Match `this` followed by `other`, without consuming `other`.
   *
   * Python PEG: `this &other`
   */
  with<U>(other: Parser<U>): Parser<T> {
    return this.thenIgnore(
      new Parser((stream) => {
        const offset = stream.offset;
        const result = other.parse(stream);
        stream.seek(offset);
        return result;
      }),
    );
  }

  /**
   * Match `this` if NOT followed by `other`.
   *
   * Python PEG: `this !other`
   */
  without<U>(other: Parser<U>): Parser<T> {
    return this.thenIgnore(
      new Parser((stream) => {
        const offset = stream.offset;
        const result = other.parse(stream);
        stream.seek(offset);
        return result.success ? failure() : success(null);
      }),
    );
  }

  /**
   * Commit to the current alternative, even if it fails to parse.
   *
   * Python PEG: `~`
   */
  commit(): Parser<T> {
    return new Parser<T>((stream) => {
      const result = this.parse(stream);
      if (!result.success) {
        if (result.matched) {
          stream.error();
        }
        return result;
      }
      stream.eager = true;
      return result;
    });
  }
}
