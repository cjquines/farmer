import type { ParseResult, ParserInfer } from "./base.js";
import { failure, success } from "./base.js";
import { Parser as P, TokenStream } from "./parser.js";
import { TokenType } from "./tokenizer.js";

const typeParser = (stops: string[]) =>
  new P<string>((stream) => {
    const stopSet = new Set(stops);
    const start = stream.offset;
    let depth = 0;
    const parts: string[] = [];

    while (!stream.done()) {
      const token = stream.peek();
      if (token.type === TokenType.OP) {
        if (token.string === "[" || token.string === "(") {
          depth += 1;
        } else if (token.string === "]" || token.string === ")") {
          depth = Math.max(0, depth - 1);
        }

        if (depth === 0 && stopSet.has(token.string)) {
          break;
        }
      } else if (depth === 0 && token.type === TokenType.STRING) {
        break;
      }

      stream.next();
      parts.push(token.string);
    }

    if (parts.length === 0) {
      stream.seek(start);
      return failure();
    }

    return success(parts.join(""));
  });

const importParser = P.and(
  P.name("from").drop().commit(),
  P.name().as("module"),
  P.name("import").drop(),
  P.op(",").join(P.name()).as("names"),
);

const enumParser = P.and(
  P.name("class").drop().commit(),
  P.name().as("name"),
  P.op(":").drop(),
  P.string().maybe().drop(),
  P.and(
    P.name().as("name"),
    P.op(":").drop(),
    P.name().as("type"),
    P.string().as("docstring"),
  )
    .many()
    .as("items"),
);

type Enum = ParserInfer<typeof enumParser>;

const methodParser = P.and(
  P.name("def").drop().commit(),
  P.name().as("name"),
  P.and(
    P.op("(").drop(),
    P.op(",")
      .join(
        P.and(
          P.or(P.op("**"), P.op("*")).maybe().drop(),
          P.name().as("name"),
          P.and(
            P.op(":").drop(),
            typeParser([",", ")", "="]).as("type"),
          ).maybe(),
          P.and(P.op("=").drop(), P.constant().as("default")).maybe(),
        ).map((param) => ({
          ...param,
          type: "type" in param ? param.type : "Any",
        })),
      )
      .maybe()
      .map((params) => params ?? [])
      .as("params"),
    P.op(",").maybe().drop(),
    P.op(")").drop(),
  ),
  P.and(P.op("->").drop(), typeParser([":"]).as("returns")).maybe(),
  P.op(":").drop(),
  P.string().as("docstring"),
  P.op("...").drop(),
).map((method) => ({
  ...method,
  returns: "returns" in method ? method.returns : "Any",
}));

type Method = ParserInfer<typeof methodParser>;

/**
 * Parse the __builtins__.py file to a minimal AST.
 *
 * We'll assume it follows a specific format: a bunch of enum-like classes,
 * followed by a bunch of methods.
 */
export function parseAST(content: string): {
  enums: Enum[];
  methods: Method[];
} {
  const stream = new TokenStream(content);
  const parseOrThrow = <T>(parser: {
    parseStream(stream: TokenStream): ParseResult<T>;
  }): T => {
    const result = parser.parseStream(stream);
    if (!result.success) {
      throw stream.error();
    }
    return result.value;
  };

  parseOrThrow(P.comment().many().drop());
  parseOrThrow(importParser.many().drop());

  const enums: Enum[] = [];
  while (true) {
    const start = stream.offset;
    parseOrThrow(P.comment().many().drop());
    const parsed = enumParser.parseStream(stream);
    if (!parsed.success) {
      stream.seek(start);
      break;
    }
    enums.push(parsed.value);
  }
  if (enums.length === 0) {
    stream.error();
  }

  while (true) {
    const start = stream.offset;
    parseOrThrow(P.comment().many().drop());
    const assignment = P.and(
      P.name().drop(),
      P.op("=").drop(),
      P.name().drop(),
      P.op("(").maybe().drop(),
      P.op(")").maybe().drop(),
      P.string().maybe().drop(),
    ).parseStream(stream);
    if (!assignment.success) {
      stream.seek(start);
      break;
    }
  }

  const methods: Method[] = [];
  while (true) {
    const start = stream.offset;
    parseOrThrow(P.comment().many().drop());
    const parsed = methodParser.parseStream(stream);
    if (!parsed.success) {
      stream.seek(start);
      break;
    }
    methods.push(parsed.value);
  }

  parseOrThrow(P.eof().drop());

  return { enums, methods };
}
