export const Item = {
  /**
   * Call `use_item(Items.Weird_Substance)` on a bush to grow a maze, or on other plants to toggle their infection status.
   */
  WeirdSubstance: "Weird_Substance",
} as const;

export type Item = (typeof Item)[keyof typeof Item];
