import { describe, expect, it } from "vitest";
import {
  Call,
  Declaration,
  Import,
  JSDoc,
  Literal,
  Return,
  Type,
} from "./typescript.js";
import { typescript } from "./util.js";

describe("TypeScript printer", () => {
  it("prints import statements with optional type modifier", () => {
    expect(Import({ names: ["Thing", "Other"], module: "./module" }))
      .toBe(typescript`
        import { Thing, Other } from "./module";
      `);

    expect(Import({ type: true, names: ["Only"], module: "pkg" })).toBe(
      typescript`
        import type { Only } from "pkg";
      `,
    );
  });

  it("renders JSDoc blocks with wrapped content", () => {
    expect(JSDoc("hello world")).toBe(typescript`/** hello world */`);

    expect(JSDoc("a long comment for doc", 10)).toBe(typescript`
      /**
       * a long
       * comment
       * for doc
       */
    `);
  });

  it("declares variables and functions", () => {
    const variable = Declaration({
      comment: "desc",
      export: true,
      kind: "const",
      name: "VALUE",
      value: "42",
    });

    expect(variable).toBe(typescript`
      /** desc */
      export const VALUE = 42;
    `);

    const destructured = Declaration({
      export: true,
      name: "useThing",
      generics: ["T", "U"],
      params: [
        { comment: "first", name: "foo", type: "string" },
        { name: "bar", type: "number", default: "3" },
      ],
      returns: "T",
      body: "return foo as T;",
    });

    expect(destructured).toBe(typescript`
      export function useThing<T, U>(
        {
          foo,
          bar = 3,
        }: {
          /** first */
          foo: string;
          bar?: number;
        }
      ): T {
        return foo as T;
      }
    `);

    const positional = Declaration({
      export: false,
      name: "add",
      params: [
        { name: "a", type: "number" },
        { name: "b", type: "number" },
      ],
      namedParams: false,
      body: "return a + b;",
    });

    expect(positional).toBe(typescript`
      function add(a: number, b: number) {
        return a + b;
      }
    `);
  });

  it("prints literal values", () => {
    expect(Literal([1, 2])).toBe(typescript`[1, 2]`);
    expect(Literal({ foo: "bar", count: 3 })).toBe(
      typescript`{ foo: "bar", count: 3 }`,
    );

    const objectLiteral = Literal.Object([
      ["first", { comment: "primary", value: "Value.FIRST" }],
      ["second", "Value.SECOND"],
    ]);

    expect(objectLiteral).toBe(typescript`
      {
        /** primary */
        first: Value.FIRST,
        second: Value.SECOND,
      }
    `);
  });

  it("prints type compositions", () => {
    expect(Type.Union(["A", "B", "C"])).toBe(typescript`A | B | C`);
    expect(Type.Generic({ name: "Map", types: ["Key", "Value"] })).toBe(
      typescript`Map<Key, Value>`,
    );
  });

  it("renders function calls and return statements", () => {
    expect(Call({ name: "build", params: ["foo", "bar"] })).toBe(
      typescript`build(foo, bar)`,
    );

    expect(
      Call({
        name: "call",
        generics: ["Some", Type.Union(["Very", "Long"]), "Generics"],
        params: [
          "firstLongParameter",
          "secondLongParameter",
          "thirdLongParameter",
        ],
      }),
    ).toBe(typescript`
      call<Some, Very | Long, Generics>(
        firstLongParameter,
        secondLongParameter,
        thirdLongParameter,
      )
    `);

    expect(Return("value")).toBe(typescript`return value;`);
  });
});
