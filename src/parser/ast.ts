import { Parser as P, TokenStream } from "./parser.js";

type EnumItem = {
  name: string;
  type: string;
  docstring: string;
};

type Enum = {
  name: string;
  items: EnumItem[];
};

const enumParser = P.and(
  P.and(
    P.name("class").drop(),
    P.name(),
    P.op(":").drop(),
    P.string().maybe().drop(),
  ).as("name"),
  P.and(
    P.name().as("name"),
    P.op(":").drop(),
    P.name().as("type"),
    P.string().as("docstring"),
  )
    .many()
    .as("items"),
);

type Method = {
  name: string;
  params: {
    name: string;
    default: string | number | boolean | null;
    type: string;
  }[];
  returns: string;
  docstring: string;
};

const methodParser = P.and(
  P.name("def").drop(),
  P.name().as("name"),
  P.and(
    P.op("(").drop(),
    P.and(
      P.name().as("name"),
      P.op(":").drop(),
      P.name().as("type"),
      P.op("=").maybe().drop(),
      P.constant().maybe().as("default"),
    ).many(),
    P.op(")").drop(),
  ).as("params"),
  P.op("->").drop(),
  P.name().as("returns"),
  P.op(":").drop(),
  P.string().as("docstring"),
  P.op("...").drop(),
);

const astParser = P.and(
  enumParser.many().as("enums"),
  methodParser.many().as("methods"),
);

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
  const result = astParser.parse(new TokenStream(content));
  if (!result.success) {
    throw new Error("Failed to parse __builtins__.py");
  }

  return {
    enums: result.value.enums,
    methods: result.value.methods,
  };
}
