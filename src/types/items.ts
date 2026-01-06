import type { PythonType } from "./python.js";

export const Items = {
  /** The bones of an ancient creature. */
  Bone: "Items.Bone",
  /** Obtained by harvesting sorted cacti. */
  Cactus: "Items.Cactus",
  /** Obtained by harvesting carrots. */
  Carrot: "Items.Carrot",
  /**
   * Call `use_item(Items.Fertilizer)` to instantly remove 2s from the plants
   * remaining grow time.
   */
  Fertilizer: "Items.Fertilizer",
  /** Found in treasure chests in mazes. */
  Gold: "Items.Gold",
  /** Obtained by cutting grass. */
  Hay: "Items.Hay",
  /**
   * This item has been removed from the game but remains as a nostalgia
   * trophy.
   */
  Piggy: "Items.Piggy",
  /**
   * Obtained by harvesting sunflowers. The drone automatically uses this to
   * move twice as fast.
   */
  Power: "Items.Power",
  /** Obtained by harvesting pumpkins. */
  Pumpkin: "Items.Pumpkin",
  /** Used to water the ground by calling `use_item(Items.Water)`. */
  Water: "Items.Water",
  /**
   * Call `use_item(Items.Weird_Substance)` on a bush to grow a maze, or on
   * other plants to toggle their infection status.
   */
  WeirdSubstance: "Items.Weird_Substance",
  /** Obtained from bushes and trees. */
  Wood: "Items.Wood",
} as const;

export type TSItem = (typeof Items)[keyof typeof Items];

export type Item = PythonType<"Item", TSItem>;
