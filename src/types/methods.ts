import type { Item } from "./items.js";
import type { Bool, Call, Int } from "./python.js";

function call<const P extends string>(
  method: string,
  params: any[],
  returns: P,
): Call<P> {
  return { method, params, returns };
}

/**
 * Attempts to use the specified `item` `n` times. Can only be used with some items including `Items.Water`, `Items.Fertilizer` and `Items.Weird_Substance`.
 *
 * returns `True` if an item was used, `False` if the item can't be used or you don't have enough.
 *
 * takes `200` ticks to execute if it succeeded, `1` tick otherwise.
 *
 * example usage:
 * ```
 * if use_item(Items.Fertilizer):
 *     print("Fertilizer used successfully")
 * ```
 */
export function useItem({ item, n = 1 }: { item: Item; n?: Int }): Bool {
  return call("use_item", [item, n], "bool");
}
