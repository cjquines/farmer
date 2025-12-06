import type { PythonType } from "./python.js";

export const Items = {
  /**
   * Call `use_item(Items.Weird_Substance)` on a bush to grow a maze, or on other plants to toggle their infection status.
   */
  WeirdSubstance: "Weird_Substance",
} as const;

export type TSItem = (typeof Items)[keyof typeof Items];

export type Item = PythonType<"Item", TSItem>;
