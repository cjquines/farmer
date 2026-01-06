import type { PythonType } from "./python.js";

export const Hats = {
  /** A brown hat. */
  BrownHat: "Hats.Brown_Hat",
  /** A hat shaped like a cactus. */
  CactusHat: "Hats.Cactus_Hat",
  /** A hat shaped like a carrot. */
  CarrotHat: "Hats.Carrot_Hat",
  /** Equip it to start the dinosaur game. */
  DinosaurHat: "Hats.Dinosaur_Hat",
  /** A golden hat. */
  GoldHat: "Hats.Gold_Hat",
  /** A golden trophy hat. */
  GoldTrophyHat: "Hats.Gold_Trophy_Hat",
  /** A golden hat shaped like a cactus. */
  GoldenCactusHat: "Hats.Golden_Cactus_Hat",
  /** A golden hat shaped like a carrot. */
  GoldenCarrotHat: "Hats.Golden_Carrot_Hat",
  /** A golden version of the gold hat. */
  GoldenGoldHat: "Hats.Golden_Gold_Hat",
  /** A golden hat shaped like a pumpkin. */
  GoldenPumpkinHat: "Hats.Golden_Pumpkin_Hat",
  /** A golden hat shaped like a sunflower. */
  GoldenSunflowerHat: "Hats.Golden_Sunflower_Hat",
  /** A golden hat shaped like a tree. */
  GoldenTreeHat: "Hats.Golden_Tree_Hat",
  /** A gray hat. */
  GrayHat: "Hats.Gray_Hat",
  /** A green hat. */
  GreenHat: "Hats.Green_Hat",
  /** A hat shaped like a pumpkin. */
  PumpkinHat: "Hats.Pumpkin_Hat",
  /** A purple hat. */
  PurpleHat: "Hats.Purple_Hat",
  /** A silver trophy hat. */
  SilverTrophyHat: "Hats.Silver_Trophy_Hat",
  /** The default hat. */
  StrawHat: "Hats.Straw_Hat",
  /** A hat shaped like a sunflower. */
  SunflowerHat: "Hats.Sunflower_Hat",
  /** The remains of the farmer. */
  TheFarmersRemains: "Hats.The_Farmers_Remains",
  /** A fancy top hat. */
  TopHat: "Hats.Top_Hat",
  /** A traffic cone hat. */
  TrafficCone: "Hats.Traffic_Cone",
  /** A stack of traffic cones as a hat. */
  TrafficConeStack: "Hats.Traffic_Cone_Stack",
  /** A hat shaped like a tree. */
  TreeHat: "Hats.Tree_Hat",
  /** A magical wizard hat. */
  WizardHat: "Hats.Wizard_Hat",
  /** A wooden trophy hat. */
  WoodTrophyHat: "Hats.Wood_Trophy_Hat",
} as const;

export type TSHat = (typeof Hats)[keyof typeof Hats];

export type Hat = PythonType<"Hat", TSHat>;
