import type { PythonType } from "./python.js";

export const Leaderboards = {
  /** Farm 33554432 cacti with multiple drones. */
  Cactus: "Leaderboards.Cactus",
  /** Farm 131072 cacti with a single drone on an 8x8 farm. */
  CactusSingle: "Leaderboards.Cactus_Single",
  /** Farm 2000000000 carrots with multiple drones. */
  Carrots: "Leaderboards.Carrots",
  /** Farm 100000000 carrots with a single drone on an 8x8 farm. */
  CarrotsSingle: "Leaderboards.Carrots_Single",
  /** Farm 33488928 bones with multiple drones. */
  Dinosaur: "Leaderboards.Dinosaur",
  /**
   * The most prestigious category. Completely automate the game from a single
   * farm plot to unlocking the leaderboards again.
   */
  FastestReset: "Leaderboards.Fastest_Reset",
  /** Farm 2 000 000 hay with multiple drones. */
  Hay: "Leaderboards.Hay",
  /** Farm 10 000 000 hay with a single drone on an 8x8 farm. */
  HaySingle: "Leaderboards.Hay_Single",
  /** Farm 9 863 168 gold with multiple drones. */
  Maze: "Leaderboards.Maze",
  /** Farm 616 448 gold with a single drone on an 8x8 farm. */
  MazeSingle: "Leaderboards.Maze_Single",
  /** Farm 2 000 000 pumpkins with multiple drones. */
  Pumpkins: "Leaderboards.Pumpkins",
  /** Farm 1 000 000 pumpkins with a single drone on an 8x8 farm. */
  PumpkinsSingle: "Leaderboards.Pumpkins_Single",
  /** Farm 10 000 power with multiple drones. */
  Sunflowers: "Leaderboards.Sunflowers",
  /** Farm 10 000 power with a single drone on an 8x8 farm. */
  SunflowersSingle: "Leaderboards.Sunflowers_Single",
  /** Farm 10 000 000 000 wood with multiple drones. */
  Wood: "Leaderboards.Wood",
  /** Farm 500 000 000 wood with a single drone on an 8x8 farm. */
  WoodSingle: "Leaderboards.Wood_Single",
} as const;

export type TSLeaderboard = (typeof Leaderboards)[keyof typeof Leaderboards];

export type Leaderboard = PythonType<"Leaderboard", TSLeaderboard>;
