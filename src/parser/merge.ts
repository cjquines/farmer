import type { ParserDrop, ParserObject } from "./base.js";
import { Parser } from "./base.js";

type ArrayOf<T> = T extends null
  ? []
  : T extends [...infer Ts]
    ? Ts
    : T extends (infer Ts)[]
      ? Ts[]
      : [T];

/** Merge two parser results. */
export type Merge<T, U> = T extends ParserDrop
  ? U
  : U extends ParserDrop
    ? T
    : T extends ParserObject<infer To>
      ? U extends ParserObject<infer Uo>
        ? ParserObject<To & Uo>
        : ParserObject<To>
      : [...ArrayOf<T>, ...ArrayOf<U>];

/**
 * Merge two parser results.
 *
 * - If either is `Drop`, return the other.
 * - If `a` is an object, merge `b` into it.
 * - Else, concatenate `a` and `b`.
 */
export function merge<T, U>(a: T, b: U): Merge<T, U>;
export function merge<T, U>(a: T, b: U) {
  if (a === Parser.Drop) {
    return b;
  }

  if (b === Parser.Drop) {
    return a;
  }

  if (Parser.isObject(a)) {
    if (Parser.isObject(b)) {
      return {
        ...a,
        ...b,
      } as Merge<T, U>;
    }
    return a;
  }

  const result = [];

  if (Array.isArray(a)) {
    result.push(...a);
  } else {
    result.push(a);
  }

  if (Array.isArray(b)) {
    result.push(...b);
  } else {
    result.push(b);
  }

  return result;
}
