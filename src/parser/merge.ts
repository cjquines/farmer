import type { ParserDrop, ParserObject, UnwrapParserObject } from "./base.js";
import { Parser } from "./base.js";

type ArrayOf<T> = T extends null
  ? []
  : T extends [...infer Ts]
    ? Ts
    : T extends (infer Ts)[]
      ? Ts[]
      : [T];

type Merge_<T, U> = T extends ParserDrop
  ? U
  : U extends ParserDrop
    ? T
    : T extends ParserObject<infer To>
      ? U extends ParserObject<infer Uo>
        ? ParserObject<To & Uo>
        : ParserObject<To>
      : [...ArrayOf<T>, ...ArrayOf<U>];

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

/** Merge parser results. */
export type Merge<T, U> = Simplify<UnwrapParserObject<Merge_<T, U>>>;

/** Merge multiple parser results. */
export type MergeMany<T extends unknown[]> = T extends [infer First]
  ? First
  : T extends [infer First, ...infer Rest]
    ? Merge<First, MergeMany<Rest>>
    : never;

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
      Object.assign(a, b);
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
