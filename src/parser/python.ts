import type { Parser } from "./combinators.js";

type EnumItem = {
  name: string;
  type: string;
  docstring: string;
};

type Enum = {
  name: string;
  items: EnumItem[];
};

// @ts-expect-error - TODO
const parseEnum: Parser<Enum> = null;

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

// @ts-expect-error - TODO
const parseMethod: Parser<Method> = null;

/**
 * Parse the __builtins__.py file to a minimal Python AST.
 *
 * We'll assume it follows a specific format: a bunch of enum-like classes,
 * followed by a bunch of methods.
 */
export function parseAST(content: string): {
  enums: Enum[];
  methods: Method[];
} {
  throw new Error("Not implemented");
}
