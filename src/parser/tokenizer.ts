export const TokenType = {
  NAME: "NAME",
  NUMBER: "NUMBER",
  STRING: "STRING",
  OP: "OP",
  COMMENT: "COMMENT",
  ENDMARKER: "ENDMARKER",
} as const;
export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export type Token<T extends TokenType = TokenType> = {
  type: T;
  string: string;
};

const Char = {
  nameStart: /[a-zA-Z_]/,
  name: /[a-zA-Z0-9_]/,
  number: /[0-9]/,
  op: /[=+\-*/%&|^<>@:~!()\[\]{},;\.]/,
};

export function* tokenize(content: string): Generator<Token> {
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
        yield {
          type: TokenType.COMMENT,
          string: content.slice(start, end),
        };
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
          yield {
            type: TokenType.STRING,
            string: content.slice(start + 3, end),
          };
          start = end + 3;
        } else {
          let end = start + 1;
          while (end < content.length && content[end] !== content[start]) {
            end += 1;
          }
          yield {
            type: TokenType.STRING,
            string: content.slice(start + 1, end),
          };
          start = end;
        }
        continue;
      }
    }

    if (Char.nameStart.test(char)) {
      let end = start + 1;
      while (end < content.length && Char.name.test(content[end]!)) {
        end += 1;
      }
      yield {
        type: TokenType.NAME,
        string: content.slice(start, end),
      };
      start = end;
      continue;
    }

    if (Char.number.test(char)) {
      let end = start + 1;
      while (end < content.length && Char.number.test(content[end]!)) {
        end += 1;
      }
      yield {
        type: TokenType.NUMBER,
        string: content.slice(start, end),
      };
      start = end;
      continue;
    }

    if (Char.op.test(char)) {
      let end = start + 1;
      while (end < content.length && Char.op.test(content[end]!)) {
        end += 1;
      }
      yield {
        type: TokenType.OP,
        string: content.slice(start, end),
      };
      start = end;
      continue;
    }

    throw new Error(`Unexpected character: ${char}`);
  }

  yield {
    type: TokenType.ENDMARKER,
    string: "",
  };
}
