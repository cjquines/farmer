import type { PythonType } from "./python.js";

export const Items = {
  /** The bones of an ancient creature. */
  Bone: "Bone",
  /** Obtained by harvesting sorted cacti. */
  Cactus: "Cactus",
  /** Obtained by harvesting carrots. */
  Carrot: "Carrot",
  /**
   * Call `use_item(Items.Fertilizer)` to instantly remove 2s from the plants
   * remaining grow time.
   */
  Fertilizer: "Fertilizer",
  /** Found in treasure chests in mazes. */
  Gold: "Gold",
  /** Obtained by cutting grass. */
  Hay: "Hay",
  /** This item has been removed from the game but remains as a nostalgia trophy. */
  Piggy: "Piggy",
  /**
   * Obtained by harvesting sunflowers. The drone automatically uses this to move
   * twice as fast.
   */
  Power: "Power",
  /** Obtained by harvesting pumpkins. */
  Pumpkin: "Pumpkin",
  /** Used to water the ground by calling `use_item(Items.Water)`. */
  Water: "Water",
  /**
   * Call `use_item(Items.Weird_Substance)` on a bush to grow a maze, or on other
   * plants to toggle their infection status.
   */
  WeirdSubstance: "Weird_Substance",
  /** Obtained from bushes and trees. */
  Wood: "Wood",
} as const;

export type TSItem = (typeof Items)[keyof typeof Items];

export type Item = PythonType<"Item", TSItem>;