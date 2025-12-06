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

describe("TypeScript printer", () => {
  it("prints import statements with optional type modifier", () => {
    expect(
      Import({ names: ["Thing", "Other"], module: "./module" }),
    ).toMatchInlineSnapshot(`"import { Thing Other } from "./module""`);

    expect(
      Import({ type: true, names: ["Only"], module: "pkg" }),
    ).toMatchInlineSnapshot(`"import type { Only } from "pkg""`);
  });

  it("renders JSDoc blocks with wrapped content", () => {
    expect(JSDoc("hello world")).toMatchInlineSnapshot(`"/**  hello world */"`);

    expect(JSDoc("a long comment for doc", 10)).toMatchInlineSnapshot(`
      "/**
       
      *
       
       
      a
       
      l
      o
      n
      g


       
      *
       
      c
      o
      m
      m
      e
      n
      t


       
      *
       
      f
      o
      r
       
      d
      o
      c
       */"
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

    expect(variable).toMatchInlineSnapshot(`
      "/**  desc */
      export constVALUE = 42;"
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

    expect(destructured).toMatchInlineSnapshot(`
      "
      export function useThing<T, U>(
      {
      foo, bar = 3
      }: {
          /**  first */;
        foo: string;
        bar?: number;
      }
      ): T {
        return foo as T;
      }"
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

    expect(positional).toMatchInlineSnapshot(`
      "
      function add(a: number b: number) {
        return a + b;
      }"
    `);
  });

  it("prints literal values", () => {
    expect(Literal([1, 2])).toMatchInlineSnapshot(`"[ 1, 2, ]"`);
    expect(Literal({ foo: "bar", count: 3 })).toMatchInlineSnapshot(
      `"{ foo: "bar", count: 3, }"`,
    );

    const objectLiteral = (Literal as any).Object([
      ["first", { comment: "primary", value: "Value.FIRST" }],
      ["second", "Value.SECOND"],
    ]);

    expect(objectLiteral).toMatchInlineSnapshot(`
      "{
        /**  primary */
        first: Value.FIRST,
        second: Value.SECOND,
      }"
    `);
  });

  it("prints type compositions", () => {
    expect(Type.Union(["A", "B", "C"])).toMatchInlineSnapshot(`"A | B | C"`);
    expect(
      Type.Generic({ name: "Map", types: ["Key", "Value"] }),
    ).toMatchInlineSnapshot(`"Map<Key, Value>"`);
  });

  it("renders function calls and return statements", () => {
    expect(
      Call({ name: "build", params: ["foo", "bar"] }),
    ).toMatchInlineSnapshot(`"buildfalse(falsefoo, bar)"`);

    expect(
      Call({
        name: "call",
        generics: ["X".repeat(81)],
        params: ["first", "second"],
      }),
    ).toMatchInlineSnapshot(`
      "call<XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX>(
        first,
        second)"
    `);

    expect(Return("value")).toMatchInlineSnapshot(`"return value;"`);
  });
});
