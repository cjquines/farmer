import type { PythonType } from "./python.js";

export const Hats = {
  /** A brown hat. */
  BrownHat: "Brown_Hat",
  /** A hat shaped like a cactus. */
  CactusHat: "Cactus_Hat",
  /** A hat shaped like a carrot. */
  CarrotHat: "Carrot_Hat",
  /** Equip it to start the dinosaur game. */
  DinosaurHat: "Dinosaur_Hat",
  /** A golden hat. */
  GoldHat: "Gold_Hat",
  /** A golden trophy hat. */
  GoldTrophyHat: "Gold_Trophy_Hat",
  /** A golden hat shaped like a cactus. */
  GoldenCactusHat: "Golden_Cactus_Hat",
  /** A golden hat shaped like a carrot. */
  GoldenCarrotHat: "Golden_Carrot_Hat",
  /** A golden version of the gold hat. */
  GoldenGoldHat: "Golden_Gold_Hat",
  /** A golden hat shaped like a pumpkin. */
  GoldenPumpkinHat: "Golden_Pumpkin_Hat",
  /** A golden hat shaped like a sunflower. */
  GoldenSunflowerHat: "Golden_Sunflower_Hat",
  /** A golden hat shaped like a tree. */
  GoldenTreeHat: "Golden_Tree_Hat",
  /** A gray hat. */
  GrayHat: "Gray_Hat",
  /** A green hat. */
  GreenHat: "Green_Hat",
  /** A hat shaped like a pumpkin. */
  PumpkinHat: "Pumpkin_Hat",
  /** A purple hat. */
  PurpleHat: "Purple_Hat",
  /** A silver trophy hat. */
  SilverTrophyHat: "Silver_Trophy_Hat",
  /** The default hat. */
  StrawHat: "Straw_Hat",
  /** A hat shaped like a sunflower. */
  SunflowerHat: "Sunflower_Hat",
  /** The remains of the farmer. */
  TheFarmersRemains: "The_Farmers_Remains",
  /** A fancy top hat. */
  TopHat: "Top_Hat",
  /** A traffic cone hat. */
  TrafficCone: "Traffic_Cone",
  /** A stack of traffic cones as a hat. */
  TrafficConeStack: "Traffic_Cone_Stack",
  /** A hat shaped like a tree. */
  TreeHat: "Tree_Hat",
  /** A magical wizard hat. */
  WizardHat: "Wizard_Hat",
  /** A wooden trophy hat. */
  WoodTrophyHat: "Wood_Trophy_Hat",
} as const;

export type TSHat = (typeof Hats)[keyof typeof Hats];

export type Hat = PythonType<"Hat", TSHat>;