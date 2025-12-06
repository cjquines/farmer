import { Parser as P, TokenStream } from "./parser.js";
import type { Token } from "./tokenizer.js";
import { TokenType } from "./tokenizer.js";

type EnumItem = {
  name: string;
  type: string;
  docstring: string;
};

type Enum = {
  name: string;
  items: EnumItem[];
};

const enumHeader = P.name("class")
  .drop()
  .and(P.name())
  .and(P.op(":").drop())
  .and(P.string().maybe())
  .map(([name, doc]) => ({ name, doc: doc ?? "" }));

const enumItem = P.name()
  .and(P.op(":").drop())
  .and(P.name())
  .and(P.string().maybe())
  .map(([name, type, doc]) => ({
    name,
    type,
    docstring: doc ?? "",
  }));

const parseEnum: P<Enum> = new P((stream) =>
  stream.try((backtrack) => {
    const header = enumHeader.parse(stream);
    if (!header.success) {
      return backtrack(header.matched);
    }

    const items: EnumItem[] = [];
    while (!stream.done()) {
      const token = stream.peek();
      if (
        token.type === TokenType.NAME &&
        (token.string === "class" || token.string === "def")
      ) {
        break;
      }

      const result = enumItem.parse(stream);
      if (result.success) {
        items.push(result.value);
        continue;
      }

      stream.next();
    }

    return {
      success: true as const,
      value: { name: header.value.name, items },
    };
  }),
);

type Method = {
  name: string;
  params: {
    name: string;
    default?: string;
    type: string;
  }[];
  returns: string;
  docstring: string;
};

const methodHeader = P.name("def").drop().and(P.name()).and(P.op("(").drop());

const parseMethod: P<Method> = new P((stream) =>
  stream.try((backtrack) => {
    const header = methodHeader.parse(stream);
    if (!header.success) {
      return backtrack(header.matched);
    }

    const paramsTokens = collectBalanced(stream, "(", ")");
    if (!paramsTokens) {
      return backtrack(true);
    }

    const params = parseParams(paramsTokens);

    let returns = "None";
    const arrow = P.op("->").parse(stream);
    if (arrow.success) {
      const returnTokens: Token[] = [];
      while (
        !stream.done() &&
        !(stream.peek().type === TokenType.OP && stream.peek().string === ":")
      ) {
        returnTokens.push(stream.next());
      }
      returns =
        returnTokens.length > 0
          ? returnTokens.map((token) => token.string).join("")
          : "None";
    }

    const colon = P.op(":").parse(stream);
    if (!colon.success) {
      return backtrack(true);
    }

    const doc = P.string().maybe().parse(stream);
    const docstring = doc.success && doc.value ? doc.value.trim() : "";

    while (!stream.done() && !isTerminator(stream.peek())) {
      stream.next();
    }

    return {
      success: true as const,
      value: {
        name: header.value,
        params,
        returns,
        docstring,
      },
    };
  }),
);

function isTerminator(token: Token) {
  return (
    (token.type === TokenType.NAME &&
      (token.string === "def" || token.string === "class")) ||
    token.type === TokenType.ENDMARKER
  );
}

function collectBalanced(
  stream: TokenStream,
  open: string,
  close: string,
): Token[] | null {
  const tokens: Token[] = [];
  let depth = 1;

  while (!stream.done() && depth > 0) {
    const token = stream.next();
    if (token.type === TokenType.OP) {
      for (const char of token.string) {
        if (char === open) {
          depth += 1;
        } else if (char === close) {
          depth -= 1;
        }
      }
    }

    if (depth > 0) {
      tokens.push(token);
    }
  }

  if (depth !== 0) {
    return null;
  }

  return tokens;
}

function parseParams(tokens: Token[]): Method["params"] {
  const params: Method["params"] = [];

  let index = 0;
  while (index < tokens.length) {
    if (tokens[index]?.type === TokenType.OP && tokens[index]?.string === ",") {
      index += 1;
      continue;
    }

    if (
      tokens[index]?.type === TokenType.OP &&
      (tokens[index]?.string === "*" || tokens[index]?.string === "**")
    ) {
      index += 1;
    }

    const nameToken = tokens[index];
    if (!nameToken || nameToken.type !== TokenType.NAME) {
      break;
    }
    index += 1;

    let type = "Any";
    let default_: string | undefined;

    if (
      tokens[index] &&
      tokens[index]!.type === TokenType.OP &&
      tokens[index]!.string === ":"
    ) {
      index += 1;
      const { value, next } = collectUntil(tokens, index, [",", "="]);
      type = value || "Any";
      index = next;
    }

    if (
      tokens[index] &&
      tokens[index]!.type === TokenType.OP &&
      tokens[index]!.string === "="
    ) {
      index += 1;
      const { value, next } = collectUntil(tokens, index, [","]);
      default_ = value;
      index = next;
    }

    params.push({
      name: nameToken.string,
      ...(default_ ? { default: default_ } : {}),
      type,
    });
  }

  return params;
}

function collectUntil(
  tokens: Token[],
  start: number,
  separators: string[],
): { value: string; next: number } {
  const parts: string[] = [];
  let depth = 0;
  let index = start;

  while (index < tokens.length) {
    const token = tokens[index]!;
    if (token.type === TokenType.OP) {
      for (const char of token.string) {
        if (char === "[" || char === "(" || char === "{") {
          depth += 1;
        } else if (char === "]" || char === ")" || char === "}") {
          depth -= 1;
        }
      }
    }

    if (isSeparator(token, depth, separators)) {
      break;
    }

    parts.push(token.string);
    index += 1;
  }

  return { value: parts.join(""), next: index };
}

function isSeparator(token: Token, depth: number, separators: string[]) {
  return (
    depth === 0 &&
    token.type === TokenType.OP &&
    separators.includes(token.string)
  );
}

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
  const enums: Enum[] = [];
  const methods: Method[] = [];

  while (!stream.done()) {
    const token = stream.peek();
    if (token.type === TokenType.NAME && token.string === "class") {
      const result = parseEnum.parse(stream);
      if (result.success) {
        enums.push(result.value);
        continue;
      }
      stream.next();
      continue;
    }

    if (token.type === TokenType.NAME && token.string === "def") {
      const result = parseMethod.parse(stream);
      if (result.success) {
        methods.push(result.value);
        continue;
      }
      stream.next();
      continue;
    }

    stream.next();
  }

  return { enums, methods };
}
