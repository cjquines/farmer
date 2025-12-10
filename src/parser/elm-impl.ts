export type Located<Context> = {
  row: number;
  col: number;
  context: Context;
};

export class Stream<C> {
  src: string;
  offset: number;
  indent: number;
  context: Located<C>[];
  row: number;
  col: number;

  constructor(src: string) {
    this.src = src;
    this.offset = 0;
    this.indent = 1;
    this.context = [];
    this.row = 1;
    this.col = 1;
  }

  problem<X>(x: X): Problem<C, X> {
    return {
      context: this.context,
      row: this.row,
      col: this.col,
      problem: x,
    };
  }

  seek(offset: number): void {
    const oldOffset = this.offset;
    this.offset = offset;
    this.col = this.col + (offset - oldOffset);
  }

  // isSubString
  take(substring: string): boolean;
  // isSubChar
  take(pred: (char: string) => boolean): boolean;
  take(input: string | ((char: string) => boolean)): boolean {
    if (typeof input === "function") {
      if (this.src.length <= this.offset) {
        return false;
      }
      if ((this.src.charCodeAt(this.offset) & 0xf800) === 0xd800) {
        if (input(this.src.substring(this.offset, this.offset + 2))) {
          this.offset += 2;
          this.col += 1;
          return true;
        } else {
          return false;
        }
      }
      if (input(this.src[this.offset]!)) {
        if (this.src[this.offset] === "\n") {
          this.offset += 1;
          this.row += 1;
          this.col = 1;
          return true;
        } else {
          this.offset += 1;
          this.col += 1;
          return true;
        }
      }
      return false;
    }

    const smallLength = input.length;
    let isGood = this.offset + smallLength <= this.src.length;
    let i = 0;
    while (isGood && i < smallLength) {
      const code = this.src.charCodeAt(this.offset);
      isGood &&= input[i] === this.src[this.offset];
      i += 1;
      this.offset += 1;
      if (code === 0x000a) {
        this.row += 1;
        this.col = 1;
      } else {
        this.col += 1;
        if ((code & 0xf800) === 0xd800) {
          isGood &&= input[i] === this.src[this.offset];
          i += 1;
          this.offset += 1;
        }
      }
    }
    return isGood;
  }
}

export type Problem<Context, Error> = {
  context: Located<Context>[];
  row: number;
  col: number;
  problem: Error;
};

export type Result<Context, Error, Value> =
  | { success: true; committed: boolean; value: Value }
  | {
      success: false;
      committed: boolean;
      problems: Problem<Context, Error>[];
    };

export type ParserFunc<Context, Problem, Value> = (
  stream: Stream<Context>,
) => Result<Context, Problem, Value>;

class Tupler<S extends any[]> {
  state: S;

  constructor(state: S) {
    this.state = state;
  }

  reduce<T>(t: T): Tupler<[...S, T]> {
    return new Tupler([...this.state, t]);
  }
}

export class Parser<S, X, A> {
  stream: Stream<S> | undefined;
  parseFunc: ParserFunc<S, X, A>;

  constructor(parseFunc: ParserFunc<S, X, A>) {
    this.parseFunc = parseFunc;
  }

  parse(src: string) {
    this.stream = new Stream<S>(src);
    return this.parseFunc(this.stream);
  }

  static succeed<C, X, A>(a: A): Parser<C, X, A> {
    return new Parser(() => ({
      success: true,
      committed: false,
      value: a,
    }));
  }

  static tuple<C, X>(): Parser<C, X, Tupler<[]>> {
    return Parser.succeed(new Tupler([]));
  }

  take<B>(parser: Parser<S, X, B>) {
    return new Parser((stream) => this.parseFunc(stream));
  }
}
