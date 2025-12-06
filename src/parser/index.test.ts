import { describe, expect, it } from "vitest";
import { python, typescript } from "../printer/util.js";
import { parseAST } from "./ast.js";
import { parseBuiltins } from "./index.js";

const sampleBuiltins = python`
  # comment 1
  # comment 2

  from typing import Any
  from builtins import type

  # divider
  class Item:
      """A member of the Items class"""


  class Items:
      Foo: Item
      """Foo doc"""

      Bar_Baz: Item
      """Bar doc"""


  # divider
  def do_thing(count: int = 1) -> bool:
      """Does a thing."""
      ...


  # divider
  def mystery(value: Any) -> None:
      """Unknown param type."""
      ...
`;

describe("parseAST", () => {
  it("parses enum-like classes and methods with docstrings", () => {
    const ast = parseAST(sampleBuiltins);

    expect(ast.enums).toEqual([
      { name: "Item", items: [] },
      {
        name: "Items",
        items: [
          { name: "Foo", type: "Item", docstring: "Foo doc" },
          { name: "Bar_Baz", type: "Item", docstring: "Bar doc" },
        ],
      },
    ]);

    expect(ast.methods).toEqual([
      {
        name: "do_thing",
        params: [{ name: "count", default: 1, type: "int" }],
        returns: "bool",
        docstring: "Does a thing.",
      },
      {
        name: "mystery",
        params: [{ name: "value", default: null, type: "Any" }],
        returns: "None",
        docstring: "Unknown param type.",
      },
    ]);
  });
});

describe("parseBuiltins", () => {
  it("generates enum and method TypeScript files", () => {
    const files = parseBuiltins(sampleBuiltins);

    const items = files.find((file) => file.filename === "items.ts");
    expect(items?.content).toBe(
      typescript`
        import type { PythonType } from "./python.js";

        export const Items = {
          /** Foo doc */
          Foo: "Foo",
          /** Bar doc */
          BarBaz: "Bar_Baz",
        } as const;

        export type TSItem = (typeof Items)[keyof typeof Items];

        export type Item = PythonType<"Item", TSItem>;
      `,
    );

    const methods = files.find((file) => file.filename === "methods.ts");
    expect(methods?.content).toBe(
      typescript`
        import type { Any, Bool, Int, None } from "./python.js";
        import { call } from "./python.js";

        /** Does a thing. */
        export function doThing({ count = 1 }: { count?: Int }): Bool {
          return call("do_thing", [count], "bool");
        }

        /** Unknown param type. */
        export function mystery({ value }: { value: Any }): None {
          return call("mystery", [value], "None");
        }
      `,
    );
  });
});
