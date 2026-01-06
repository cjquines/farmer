import type { PythonType } from "./python.js";

export const Grounds = {
  /** The default ground. Grass will automatically grow on it. */
  Grassland: "Grounds.Grassland",
  /**
   * Calling `till()` turns the ground into this. Calling `till()` again
   * changes it back to grassland.
   */
  Soil: "Grounds.Soil",
} as const;

export type TSGround = (typeof Grounds)[keyof typeof Grounds];

export type Ground = PythonType<"Ground", TSGround>;
