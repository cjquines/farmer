import { merge, type Merge, type MergeMany } from "./merge.js";
import { Stream as BaseStream } from "./stream.js";

export type ParseResult<T> =
  | {
      success: true;
      value: T;
    }
  | {
      success: false;
      /** Whether this parser matched any input before failing. */
      matched: boolean;
    };

export function success<T>(value: T): ParseResult<T> {
  return { success: true, value };
}

export function failure<T>(matched = false): ParseResult<T> {
  return { success: false, matched };
}

export class ParseStream<T> extends BaseStream<T> {
  eager: boolean;

  constructor(content: T[]) {
    super(content);
    this.eager = false;
  }

  try<T>(
    fn: (backtrack: (matched?: boolean) => ParseResult<T>) => ParseResult<T>,
  ): ParseResult<T> {
    const offset = this.offset;
    const backtrack = (matched = false) => {
      if (this.eager && matched) {
        this.error();
      }
      this.seek(offset);
      return failure<T>(matched);
    };
    return fn(backtrack);
  }
}

export type ParserDrop = typeof Parser.Drop;

export type ParserObject<T> = T & { [Parser.AsObject]: true };

export type UnwrapParserObject<T> = T extends ParserObject<infer U> ? U : T;

export class Parser<S, T> {
  #parse: (stream: ParseStream<S>) => ParseResult<T>;

  constructor(parse: (stream: ParseStream<S>) => ParseResult<T>) {
    this.#parse = parse;
  }

  /**
   * Parse a stream.
   *
   * We wrap the `#parse` property so inheriting classes can override it
   * for convenience.
   */
  parse(content: S[]): ParseResult<T>;
  parse(stream: ParseStream<S>): ParseResult<T>;
  parse(input: S[] | ParseStream<S>): ParseResult<T>;
  parse(input: S[] | ParseStream<S>): ParseResult<T> {
    return this.#parse(
      input instanceof ParseStream ? input : new ParseStream(input),
    );
  }

  /**
   * Transform the parsed value.
   */
  map<U>(fn: (value: T) => U): Parser<S, U> {
    return new Parser<S, U>((stream) => {
      const result = this.parse(stream);
      if (!result.success) {
        return result as any;
      }
      return success(fn(result.value));
    });
  }

  /** A symbol representing "drop this result". */
  static Drop = Symbol.for("farmer.Parser.Drop");

  /**
   * Match `this`, and ignore the result.
   */
  drop(): Parser<S, typeof Parser.Drop> {
    return this.map(() => Parser.Drop);
  }

  /**
   * A symbol marking that results are wrapped in objects, with keys merged
   * together (rather than concatenating results in a tuple).
   */
  static AsObject = Symbol.for("farmer.Parser.AsObject");

  /** Wrap the result in an object. */
  static asObject<T>(obj: T): ParserObject<T> {
    // Use `defineProperty` so it's non-enumerable:
    Object.defineProperty(obj, Parser.AsObject, { value: true });
    return obj as ParserObject<T>;
  }

  /** Check if the result is wrapped in an object. */
  static isObject<T>(obj: T): obj is ParserObject<T> {
    return (
      typeof obj === "object" &&
      obj !== null &&
      (obj as any)[Parser.AsObject] === true
    );
  }

  /**
   * Match `this`, then wrap the result as { `key`: `value` }.
   *
   * Later parsers must merge results as keys into the object; otherwise
   * their values will be dropped.
   */
  as<const K extends PropertyKey>(
    key: K,
  ): Parser<S, ParserObject<Record<K, T>>> {
    return this.map((value) =>
      Parser.asObject({ [key]: value } as Record<K, T>),
    );
  }

  /**
   * Match `this`, then succeed if `predicate` returns true.
   */
  if(predicate: (value: T) => boolean): Parser<S, T> {
    return new Parser<S, T>((stream) => {
      const result = this.parse(stream);
      if (!result.success) {
        return result;
      }
      if (!predicate(result.value)) {
        return failure(true);
      }
      return result;
    });
  }

  /**
   * Match `this` or `other`, whichever succeeds first.
   *
   * Python PEG: `this | other`
   */
  or<U>(other: Parser<S, U>): Parser<S, T | U> {
    return new Parser<S, T | U>((stream) => {
      const result = this.parse(stream);
      if (result.success) {
        return result;
      }
      return other.parse(stream);
    });
  }

  /**
   * Match the first parser that succeeds.
   *
   * Python PEG: `parser1 | parser2 | ...`
   */
  static or<S, T1>(parser1: Parser<S, T1>): Parser<S, T1>;
  static or<S, T1, T2>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
  ): Parser<S, T1 | T2>;
  static or<S, T1, T2, T3>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
  ): Parser<S, T1 | T2 | T3>;
  static or<S, T1, T2, T3, T4>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
  ): Parser<S, T1 | T2 | T3 | T4>;
  static or<S, T1, T2, T3, T4, T5>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
  ): Parser<S, T1 | T2 | T3 | T4 | T5>;
  static or<S, T1, T2, T3, T4, T5, T6>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
    parser6: Parser<S, T6>,
  ): Parser<S, T1 | T2 | T3 | T4 | T5 | T6>;
  static or<S, T1, T2, T3, T4, T5, T6, T7>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
    parser6: Parser<S, T6>,
    parser7: Parser<S, T7>,
  ): Parser<S, T1 | T2 | T3 | T4 | T5 | T6 | T7>;
  static or<S, T1, T2, T3, T4, T5, T6, T7, T8>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
    parser6: Parser<S, T6>,
    parser7: Parser<S, T7>,
    parser8: Parser<S, T8>,
  ): Parser<S, T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
  static or<S, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
    parser6: Parser<S, T6>,
    parser7: Parser<S, T7>,
    parser8: Parser<S, T8>,
    parser9: Parser<S, T9>,
  ): Parser<S, T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
  static or<S, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
    parser6: Parser<S, T6>,
    parser7: Parser<S, T7>,
    parser8: Parser<S, T8>,
    parser9: Parser<S, T9>,
    parser10: Parser<S, T10>,
  ): Parser<S, T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>;
  static or<S, Ts>(...parsers: Parser<S, Ts>[]): Parser<S, Ts>;
  static or<S, Ts>(...parsers: Parser<S, Ts>[]): Parser<S, Ts> {
    const result = parsers.at(0)!;
    return parsers.slice(1).reduce((a, b) => a.or(b) as Parser<S, Ts>, result);
  }

  /**
   * Match `this` followed by `other`.
   *
   * Python PEG: `this other`
   */
  and<U>(other: Parser<S, ParserDrop>): Parser<S, T>;
  and<U>(other: Parser<S, U>): Parser<S, Merge<T, U>>;
  and<U>(other: Parser<S, U>) {
    return new Parser<S, unknown>((stream) => {
      return stream.try((backtrack) => {
        const resultT = this.parse(stream);
        if (!resultT.success) {
          return backtrack(resultT.matched);
        }
        const resultU = other.parse(stream);
        if (!resultU.success) {
          return backtrack(true);
        }
        return success(merge(resultT.value, resultU.value));
      });
    });
  }

  /**
   * Match the parsers in sequence.
   *
   * Python PEG: `parser1 parser2 ...`
   */
  static and<S, T1>(parser1: Parser<S, T1>): Parser<S, T1>;
  static and<S, T1, T2>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
  ): Parser<S, Merge<T1, T2>>;
  static and<S, T1, T2, T3>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
  ): Parser<S, MergeMany<[T1, T2, T3]>>;
  static and<S, T1, T2, T3, T4>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
  ): Parser<S, MergeMany<[T1, T2, T3, T4]>>;
  static and<S, T1, T2, T3, T4, T5>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
  ): Parser<S, MergeMany<[T1, T2, T3, T4, T5]>>;
  static and<S, T1, T2, T3, T4, T5, T6>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
    parser6: Parser<S, T6>,
  ): Parser<S, MergeMany<[T1, T2, T3, T4, T5, T6]>>;
  static and<S, T1, T2, T3, T4, T5, T6, T7>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
    parser6: Parser<S, T6>,
    parser7: Parser<S, T7>,
  ): Parser<S, MergeMany<[T1, T2, T3, T4, T5, T6, T7]>>;
  static and<S, T1, T2, T3, T4, T5, T6, T7, T8>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
    parser6: Parser<S, T6>,
    parser7: Parser<S, T7>,
    parser8: Parser<S, T8>,
  ): Parser<S, MergeMany<[T1, T2, T3, T4, T5, T6, T7, T8]>>;
  static and<S, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
    parser6: Parser<S, T6>,
    parser7: Parser<S, T7>,
    parser8: Parser<S, T8>,
    parser9: Parser<S, T9>,
  ): Parser<S, MergeMany<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>>;
  static and<S, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    parser1: Parser<S, T1>,
    parser2: Parser<S, T2>,
    parser3: Parser<S, T3>,
    parser4: Parser<S, T4>,
    parser5: Parser<S, T5>,
    parser6: Parser<S, T6>,
    parser7: Parser<S, T7>,
    parser8: Parser<S, T8>,
    parser9: Parser<S, T9>,
    parser10: Parser<S, T10>,
  ): Parser<S, MergeMany<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>>;
  static and<S, Ts>(...parsers: Parser<S, Ts>[]): Parser<S, Ts[]>;
  static and<S, Ts>(...parsers: Parser<S, Ts>[]) {
    const result = parsers.at(0)!;
    return parsers.slice(1).reduce((a, b) => a.and(b) as any, result);
  }

  /**
   * Optionally match `this`.
   *
   * Python PEG: `[ this ]` or `this?`
   */
  maybe(): Parser<S, T | null> {
    return new Parser<S, T | null>((stream) => {
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
  many(): Parser<S, T[]> {
    return new Parser<S, T[]>((stream) => {
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
  some(): Parser<S, [T, ...T[]]>;
  some() {
    return this.and(this.many()) as unknown;
  }

  /**
   * Match one or more occurrences of `other`, separated by `this`. The
   * result does not include `this`.
   *
   * Python PEG: `this.other+`
   */
  join<U>(other: Parser<S, U>): Parser<S, [U, ...U[]]>;
  join<U>(other: Parser<S, U>) {
    return other.and(this.drop().and(other).many());
  }

  /**
   * Match `this` followed by `other`, without consuming `other`.
   *
   * Python PEG: `this &other`
   */
  with<U>(other: Parser<S, U>): Parser<S, T> {
    return this.and(
      new Parser<S, U>((stream) => {
        const offset = stream.offset;
        const result = other.parse(stream);
        stream.seek(offset);
        return result;
      }).drop(),
    );
  }

  /**
   * Match `this` if NOT followed by `other`.
   *
   * Python PEG: `this !other`
   */
  without<U>(other: Parser<S, U>): Parser<S, T> {
    return this.and(
      new Parser<S, null>((stream) => {
        const offset = stream.offset;
        const result = other.parse(stream);
        stream.seek(offset);
        return result.success ? failure() : success(null);
      }).drop(),
    );
  }

  /**
   * Commit to the current alternative, even if it fails to parse.
   *
   * Python PEG: `~`
   */
  commit(): Parser<S, T> {
    return new Parser<S, T>((stream) => {
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

export type ParserInfer<T> = T extends Parser<any, infer T> ? T : never;
