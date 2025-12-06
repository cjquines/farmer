export class Stream<S> {
  #content: S[];
  #offset: number;

  constructor(content: S[]) {
    this.#content = content;
    this.#offset = 0;
  }

  get offset() {
    return this.#offset;
  }

  error(): never {
    throw new Error(`Syntax error at ${this.offset} = ${this.peek()}`);
  }

  peek(): S {
    return this.#content[this.offset]!;
  }

  next(): S {
    const token = this.#content[this.offset]!;
    this.#offset += 1;
    return token;
  }

  seek(index: number) {
    this.#offset = index;
  }

  done(): boolean {
    return this.offset >= this.#content.length;
  }
}
