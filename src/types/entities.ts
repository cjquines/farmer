import type { PythonType } from "./python.js";

export const Entities = {
  /** Dinosaurs love them apparently. */
  Apple: "Apple",
  /**
   * A small bush that drops `Items.Wood`.      Average seconds to grow: 4     Grows
   * on: grassland or soil     
   */
  Bush: "Bush",
  /**
   * Cacti come in 10 different sizes (0-9). When harvested, adjacent cacti that are
   * in sorted order will also be harvested recursively.     You receive cactus equal
   * to the number of harvested cacti squared.      Average seconds to grow: 1    
   * Grows on: soil     
   */
  Cactus: "Cactus",
  /** Carrots!      Average seconds to grow: 6     Grows on: soil      */
  Carrot: "Carrot",
  /**
   * One in five pumpkins dies when it grows up, leaving behind a dead pumpkin. Dead
   * pumpkins are useless and disappear when something new is planted.    
   * `can_harvest()` always returns `False` on dead pumpkins.     
   */
  DeadPumpkin: "Dead_Pumpkin",
  /**
   * A piece of the tail of the dinosaur hat. When wearing the dinosaur hat, the tail
   * is dragged behind the drone filling previously moved tiles.      Average seconds
   * to grow: 0.2     Grows on: grassland or soil     
   */
  Dinosaur: "Dinosaur",
  /**
   * Grows automatically on grassland. Harvest it to obtain `Items.Hay`.      Average
   * seconds to grow: 0.5     Grows on: grassland or soil     
   */
  Grass: "Grass",
  /** Part of the maze. */
  Hedge: "Hedge",
  /**
   * Pumpkins grow together when they are next to other fully grown pumpkins. About 1
   * in 5 pumpkins dies when it grows up.     When you harvest a pumpkin you get
   * `Items.Pumpkin` equal to the number of pumpkins in the mega pumpkin cubed.     
   * Average seconds to grow: 2     Grows on: soil     
   */
  Pumpkin: "Pumpkin",
  /**
   * Sunflowers collect the power from the sun. Harvesting them will give you
   * `Items.Power`.     If you harvest a sunflower with the maximum number of petals
   * (and there are at least 10 sunflowers) you get 5x bonus power.      Average
   * seconds to grow: 5     Grows on: soil     
   */
  Sunflower: "Sunflower",
  /**
   * A treasure that contains gold equal to the side length of the maze in which it
   * is hidden. It can be harvested like a plant.
   */
  Treasure: "Treasure",
  /**
   * Trees drop more wood than bushes. They take longer to grow if other trees grow
   * next to them.      Average seconds to grow: 7     Grows on: grassland or soil   
   */
  Tree: "Tree",
} as const;

export type TSEntity = (typeof Entities)[keyof typeof Entities];

export type Entity = PythonType<"Entity", TSEntity>;