import { TS } from "../printer/index.js";
import { parseAST } from "./python.js";

export function parseBuiltins(
  builtins: string,
): { filename: string; content: string }[] {
  const { enums, methods } = parseAST(builtins);

  // TODO:
  // - each enum should be its own file (like items.ts)
  // - methods should all end up in methods.ts

  for (const method of methods) {
    // add something like
    TS.Declaration({
      comment: method.docstring,
      export: true,
      name: method.name,
      params: method.params,
      returns: method.returns,
      body: TS.Return(
        TS.Call({
          name: "call",
          params: [
            TS.Literal(method.name),
            TS.Literal(method.params.map((param) => param.name)),
            TS.Literal(method.returns),
          ],
        }),
      ),
    });
  }

  throw new Error("Not implemented");
}
