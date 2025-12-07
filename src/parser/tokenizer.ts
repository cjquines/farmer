export const TokenType = {
  NAME: "NAME",
  NUMBER: "NUMBER",
  STRING: "STRING",
  OP: "OP",
  COMMENT: "COMMENT",
  ENDMARKER: "ENDMARKER",
} as const;
export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export class Token<T extends TokenType = TokenType> {
  type: T;
  string: string;

  constructor(type: T, string: string) {
    this.type = type;
    this.string = string;
  }

  toString() {
    return `${this.type}: ${this.string}`;
  }
}

const Char = {
  nameStart: /[a-zA-Z_]/,
  name: /[a-zA-Z0-9_]/,
  number: /[0-9]/,
  op: /[=+\-*/%&|^<>@:~!()\[\]{},;\.]/,
};

const THREE_CHAR_OPS = new Set(["<<=", ">>=", "//=", "**=", "..."]);
const TWO_CHAR_OPS = new Set([
  "->",
  "==",
  ">=",
  "<=",
  "!=",
  "//",
  "**",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "&=",
  "|=",
  "^=",
  ">>",
  "<<",
]);

function readOperator(
  content: string,
  start: number,
): { token: string; end: number } {
  const three = content.slice(start, start + 3);
  if (THREE_CHAR_OPS.has(three)) {
    return { token: three, end: start + 3 };
  }

  const two = content.slice(start, start + 2);
  if (TWO_CHAR_OPS.has(two)) {
    return { token: two, end: start + 2 };
  }

  return { token: content[start]!, end: start + 1 };
}

function* tokenizeGen(content: string): Generator<Token> {
  let start = 0;

  while (start < content.length) {
    const char = content[start]!;

    switch (char) {
      case " ":
      case "\n":
      case "\t":
      case "\\": {
        start += 1;
        continue;
      }
      case "#": {
        let end = start;
        while (end < content.length && content[end] !== "\n") {
          end += 1;
        }
        yield new Token(TokenType.COMMENT, content.slice(start, end));
        start = end;
        continue;
      }
      case "'":
      case '"': {
        // We don't need to handle escapes, but we do need to handle
        // triple-quoted strings.
        const isTriple =
          content[start] === content[start + 1] &&
          content[start] === content[start + 2];

        if (isTriple) {
          let end = start + 3;
          while (
            end + 2 < content.length &&
            (content[end] !== content[start] ||
              content[end + 1] !== content[start] ||
              content[end + 2] !== content[start])
          ) {
            end += 1;
          }
          yield new Token(TokenType.STRING, content.slice(start + 3, end));
          start = end + 3;
        } else {
          let end = start + 1;
          while (end < content.length && content[end] !== content[start]) {
            end += 1;
          }
          yield new Token(TokenType.STRING, content.slice(start + 1, end));
          start = end + 1;
        }
        continue;
      }
    }

    if (Char.nameStart.test(char)) {
      let end = start + 1;
      while (end < content.length && Char.name.test(content[end]!)) {
        end += 1;
      }
      yield new Token(TokenType.NAME, content.slice(start, end));
      start = end;
      continue;
    }

    if (Char.number.test(char)) {
      let end = start + 1;
      while (end < content.length && Char.number.test(content[end]!)) {
        end += 1;
      }
      yield new Token(TokenType.NUMBER, content.slice(start, end));
      start = end;
      continue;
    }

    if (Char.op.test(char)) {
      const { token, end } = readOperator(content, start);
      yield new Token(TokenType.OP, token);
      start = end;
      continue;
    }

    throw new Error(`Unexpected character: ${char}`);
  }

  yield new Token(TokenType.ENDMARKER, "");
}

export function tokenize(content: string): Token[] {
  return [...tokenizeGen(content)];
}
