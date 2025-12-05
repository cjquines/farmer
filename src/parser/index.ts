export function parseBuiltins(
  builtins: string,
): { filename: string; content: string }[] {
  throw new Error("Not implemented");

  // strategy:
  // - write a (minimal) python lexer + parser to generate an ast
  // - convert the ast to the typescript files
}
