import type { PythonType } from "./python.js";

export const Unlocks = {
  /** Automatically unlock things. */
  AutoUnlock: "Auto_Unlock",
  /** Unlock: Cactus!     Upgrade: Increases the yield and cost of cactus.      */
  Cactus: "Cactus",
  /**
   * Unlock: Till the soil and plant carrots.     Upgrade: Increases the yield and
   * cost of carrots.     
   */
  Carrots: "Carrots",
  /** Allows access to the cost of things. */
  Costs: "Costs",
  /** Tools to help with debugging programs. */
  Debug: "Debug",
  /** Functions to temporarily slow down the execution and make the grid smaller. */
  Debug2: "Debug_2",
  /** Get access to dictionaries and sets. */
  Dictionaries: "Dictionaries",
  /**
   * Unlock: Majestic ancient creatures.     Upgrade: Increases the yield and cost of
   * dinosaurs.     
   */
  Dinosaurs: "Dinosaurs",
  /**
   * Unlock: Expands the farm land and unlocks movement.     Upgrade: Expands the
   * farm. This also clears the farm.     
   */
  Expand: "Expand",
  /** Reduces the remaining growing time of the plant under the drone by 2 seconds. */
  Fertilizer: "Fertilizer",
  /** Define your own functions. */
  Functions: "Functions",
  /** Increases the yield of grass. */
  Grass: "Grass",
  /** Unlocks new hat colors for your drone. */
  Hats: "Hats",
  /** Import code from other files. */
  Import: "Import",
  /** Join the leaderboard for the fastest reset time. */
  Leaderboard: "Leaderboard",
  /** Use lists to store lots of values. */
  Lists: "Lists",
  /** Unlocks a simple while loop. */
  Loops: "Loops",
  /**
   * Unlock: A maze with a treasure in the middle.     Upgrade: Increases the gold in
   * treasure chests.     
   */
  Mazes: "Mazes",
  /** Unlocks multiple drones and drone management functions. */
  Megafarm: "Megafarm",
  /** Arithmetic, comparison and logic operators. */
  Operators: "Operators",
  /** Unlocks planting. */
  Plant: "Plant",
  /** Use companion planting to increase the yield. */
  Polyculture: "Polyculture",
  /** Unlock: Pumpkins!     Upgrade: Increases the yield and cost of pumpkins.      */
  Pumpkins: "Pumpkins",
  /** The drone can see what's under it and where it is. */
  Senses: "Senses",
  /** Unlocks simulation functions for testing and optimization. */
  Simulation: "Simulation",
  /** Increases the speed of the drone. */
  Speed: "Speed",
  /**
   * Unlock: Sunflowers and Power.     Upgrade: Increases the power gained from
   * sunflowers.     
   */
  Sunflowers: "Sunflowers",
  /** Unlocks the special hat 'The Farmers Remains'. */
  TheFarmersRemains: "The_Farmers_Remains",
  /** Functions to help measure performance. */
  Timing: "Timing",
  /** Unlocks the fancy Top Hat. */
  TopHat: "Top_Hat",
  /** Unlock: Unlocks trees.     Upgrade: Increases the yield of bushes and trees.     */
  Trees: "Trees",
  /** Unlocks the `min()`, `max()` and `abs()` functions. */
  Utilities: "Utilities",
  /** Assign values to variables. */
  Variables: "Variables",
  /** Water the plants to make them grow faster. */
  Watering: "Watering",
} as const;

export type TSUnlock = (typeof Unlocks)[keyof typeof Unlocks];

export type Unlock = PythonType<"Unlock", TSUnlock>;