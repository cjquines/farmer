import type { ParserInfer } from "./base.js";
import { Parser as P, TokenStream } from "./parser.js";

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
  const result = P.and(
    P.comment().many().drop(),
    importParser.many().drop(),
    P.and(P.comment().many().drop(), enumParser).some().as("enums"),
    P.and(P.comment().many().drop(), methodParser).some().as("methods"),
    P.eof().drop(),
  ).parse(stream);

  if (!result.success) {
    return stream.error();
  }

  return {
    enums: result.value.enums,
    methods: result.value.methods,
  };
}
