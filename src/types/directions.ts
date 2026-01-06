import type { PythonType } from "./python.js";

export const Directions = {
  /** The direction north, i.e. up. */
  North: "North",
  /** The direction east, i.e. right. */
  East: "East",
  /** The direction south, i.e. down. */
  South: "South",
  /** The direction west, i.e. left. */
  West: "West",
} as const;

export type TSDirection = (typeof Directions)[keyof typeof Directions];

export type Direction = PythonType<"Direction", TSDirection>;
