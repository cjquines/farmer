import type { PythonType } from "./python.js";

export const Unlocks = {
  /** Automatically unlock things. */
  AutoUnlock: "Unlocks.Auto_Unlock",
  /**
   * Unlock: Cactus!
   * Upgrade: Increases the yield and cost of cactus.
   */
  Cactus: "Unlocks.Cactus",
  /**
   * Unlock: Till the soil and plant carrots.
   * Upgrade: Increases the yield and cost of carrots.
   */
  Carrots: "Unlocks.Carrots",
  /** Allows access to the cost of things. */
  Costs: "Unlocks.Costs",
  /** Tools to help with debugging programs. */
  Debug: "Unlocks.Debug",
  /**
   * Functions to temporarily slow down the execution and make the grid
   * smaller.
   */
  Debug2: "Unlocks.Debug_2",
  /** Get access to dictionaries and sets. */
  Dictionaries: "Unlocks.Dictionaries",
  /**
   * Unlock: Majestic ancient creatures.
   * Upgrade: Increases the yield and cost of dinosaurs.
   */
  Dinosaurs: "Unlocks.Dinosaurs",
  /**
   * Unlock: Expands the farm land and unlocks movement.
   * Upgrade: Expands the farm. This also clears the farm.
   */
  Expand: "Unlocks.Expand",
  /**
   * Reduces the remaining growing time of the plant under the drone by 2
   * seconds.
   */
  Fertilizer: "Unlocks.Fertilizer",
  /** Define your own functions. */
  Functions: "Unlocks.Functions",
  /** Increases the yield of grass. */
  Grass: "Unlocks.Grass",
  /** Unlocks new hat colors for your drone. */
  Hats: "Unlocks.Hats",
  /** Import code from other files. */
  Import: "Unlocks.Import",
  /** Join the leaderboard for the fastest reset time. */
  Leaderboard: "Unlocks.Leaderboard",
  /** Use lists to store lots of values. */
  Lists: "Unlocks.Lists",
  /** Unlocks a simple while loop. */
  Loops: "Unlocks.Loops",
  /**
   * Unlock: A maze with a treasure in the middle.
   * Upgrade: Increases the gold in treasure chests.
   */
  Mazes: "Unlocks.Mazes",
  /** Unlocks multiple drones and drone management functions. */
  Megafarm: "Unlocks.Megafarm",
  /** Arithmetic, comparison and logic operators. */
  Operators: "Unlocks.Operators",
  /** Unlocks planting. */
  Plant: "Unlocks.Plant",
  /** Use companion planting to increase the yield. */
  Polyculture: "Unlocks.Polyculture",
  /**
   * Unlock: Pumpkins!
   * Upgrade: Increases the yield and cost of pumpkins.
   */
  Pumpkins: "Unlocks.Pumpkins",
  /** The drone can see what's under it and where it is. */
  Senses: "Unlocks.Senses",
  /** Unlocks simulation functions for testing and optimization. */
  Simulation: "Unlocks.Simulation",
  /** Increases the speed of the drone. */
  Speed: "Unlocks.Speed",
  /**
   * Unlock: Sunflowers and Power.
   * Upgrade: Increases the power gained from sunflowers.
   */
  Sunflowers: "Unlocks.Sunflowers",
  /** Unlocks the special hat 'The Farmers Remains'. */
  TheFarmersRemains: "Unlocks.The_Farmers_Remains",
  /** Functions to help measure performance. */
  Timing: "Unlocks.Timing",
  /** Unlocks the fancy Top Hat. */
  TopHat: "Unlocks.Top_Hat",
  /**
   * Unlock: Unlocks trees.
   * Upgrade: Increases the yield of bushes and trees.
   */
  Trees: "Unlocks.Trees",
  /** Unlocks the `min()`, `max()` and `abs()` functions. */
  Utilities: "Unlocks.Utilities",
  /** Assign values to variables. */
  Variables: "Unlocks.Variables",
  /** Water the plants to make them grow faster. */
  Watering: "Unlocks.Watering",
} as const;

export type TSUnlock = (typeof Unlocks)[keyof typeof Unlocks];

export type Unlock = PythonType<"Unlock", TSUnlock>;
