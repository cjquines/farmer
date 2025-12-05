export const Items = {
  Bone: "Bone",
  Cactus: "Cactus",
  Carrot: "Carrot",
  Fertilizer: "Fertilizer",
  Gold: "Gold",
  Hay: "Hay",
  Piggy: "Piggy",
  Power: "Power",
  Pumpkin: "Pumpkin",
  Water: "Water",
  WeirdSubstance: "Weird_Substance",
  Wood: "Wood",
};
export type Items = (typeof Items)[keyof typeof Items];
