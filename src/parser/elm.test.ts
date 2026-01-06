import { describe, expect, it } from "vitest";
import { bagToList, type Bag } from "./elm.js";

describe("bagToList", () => {
  it("works", () => {
    const bag: Bag<string, string> = {
      type: "Append",
      left: {
        type: "AddRight",
        left: {
          type: "AddRight",
          left: {
            type: "Empty",
          },
          right: {
            row: 1,
            col: 1,
            problem: "a",
            contextStack: [],
          },
        },
        right: {
          row: 1,
          col: 1,
          problem: "b",
          contextStack: [],
        },
      },
      right: {
        type: "Append",
        left: {
          type: "AddRight",
          left: {
            type: "AddRight",
            left: {
              type: "Empty",
            },
            right: {
              row: 1,
              col: 1,
              problem: "c",
              contextStack: [],
            },
          },
          right: {
            row: 1,
            col: 1,
            problem: "d",
            contextStack: [],
          },
        },
        right: {
          type: "AddRight",
          left: {
            type: "AddRight",
            left: {
              type: "Empty",
            },
            right: {
              row: 1,
              col: 1,
              problem: "e",
              contextStack: [],
            },
          },
          right: {
            row: 1,
            col: 1,
            problem: "f",
            contextStack: [],
          },
        },
      },
    };

    expect(bagToList(bag, [])).toMatchInlineSnapshot(`
      [
        {
          "col": 1,
          "contextStack": [],
          "problem": "a",
          "row": 1,
        },
        {
          "col": 1,
          "contextStack": [],
          "problem": "b",
          "row": 1,
        },
      ]
    `);
  });
});
