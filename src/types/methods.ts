import type { Direction } from "./directions.js";
import type { Entity } from "./entities.js";
import type { Ground } from "./grounds.js";
import type { Hat } from "./hats.js";
import type { Item } from "./items.js";
import type { Leaderboard } from "./leaderboards.js";
import type {
  Any,
  Bool,
  Dict,
  Float,
  Int,
  List,
  None,
  Str,
  Tuple,
} from "./python.js";
import { call } from "./python.js";
import type { Unlock } from "./unlocks.js";

/**
 * Harvests the entity under the drone.
 * If you harvest an entity that can't be harvested, it will be destroyed.
 *
 * returns `True` if an entity was removed, `False` otherwise.
 *
 * takes `200` ticks to execute if an entity was removed, `1` tick otherwise.
 *
 * example usage:
 * ```
 * harvest()
 * ```
 */
export function harvest(): Bool {
  return call("harvest", [], "bool");
}

/**
 * Used to find out if plants are fully grown.
 *
 * returns `True` if there is an entity under the drone that is ready to be
 * harvested, `False` otherwise.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * if can_harvest():
 *   harvest()
 * ```
 */
export function canHarvest(): Bool {
  return call("can_harvest", [], "bool");
}

/**
 * Spends the cost of the specified `entity` and plants it under the drone.
 * It fails if you can't afford the plant, the ground type is wrong or there's
 * already a plant there.
 *
 * returns `True` if it succeeded, `False` otherwise.
 *
 * takes `200` ticks to execute if it succeeded, `1` tick otherwise.
 *
 * example usage:
 * ```
 * plant(Entities.Bush)
 * ```
 */
export function plant(entity: Entity): Bool {
  return call("plant", [entity], "bool");
}

/**
 * Moves the drone into the specified `direction` by one tile.
 * If the drone moves over the edge of the farm it wraps back to the other side
 * of the farm.
 *
 * - `East `  =  right
 * - `West `  =  left
 * - `North`  =  up
 * - `South`  =  down
 *
 * returns `True` if the drone has moved, `False` otherwise.
 *
 * takes `200` ticks to execute if the drone has moved, `1` tick otherwise.
 *
 * example usage:
 * ```
 * move(North)
 * ```
 */
export function move(direction: Direction): Bool {
  return call("move", [direction], "bool");
}

/**
 * Checks if the drone can move in the specified `direction`.
 *
 * returns `True` if the drone can move, `False` otherwise.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * if can_move(North):
 *     move(North)
 * ```
 */
export function canMove(direction: Direction): Bool {
  return call("can_move", [direction], "bool");
}

/**
 * Swaps the entity under the drone with the entity next to the drone in the
 * specified `direction`.
 * - Doesn't work on all entities.
 * - Also works if one (or both) of the entities are `None`.
 *
 * returns `True` if it succeeded, `False` otherwise.
 *
 * takes `200` ticks to execute on success, `1` tick otherwise.
 *
 * example usage:
 * ```
 * swap(North)
 * ```
 */
export function swap(direction: Direction): Bool {
  return call("swap", [direction], "bool");
}

/**
 * Tills the ground under the drone into soil. If it's already soil it will
 * change the ground back to grassland.
 *
 * returns `None`
 *
 * takes `200` ticks to execute.
 *
 * example usage:
 * ```
 * till()
 * ```
 */
export function till(): None {
  return call("till", [], "None");
}

/**
 * Gets the current x position of the drone.
 * The x position starts at `0` in the `West` and increases in the `East`
 * direction.
 *
 * returns a number representing the current x coordinate of the drone.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * x, y = get_pos_x(), get_pos_y()
 * ```
 */
export function getPosX(): Int {
  return call("get_pos_x", [], "int");
}

/**
 * Gets the current y position of the drone.
 * The y position starts at `0` in the `South` and increases in the `North`
 * direction.
 *
 * returns a number representing the current y coordinate of the drone.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * x, y = get_pos_x(), get_pos_y()
 * ```
 */
export function getPosY(): Int {
  return call("get_pos_y", [], "int");
}

/**
 * Get the current size of the farm.
 *
 * returns the side length of the grid in the north to south direction.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * for i in range(get_world_size()):
 *     move(North)
 * ```
 */
export function getWorldSize(): Int {
  return call("get_world_size", [], "int");
}

/**
 * Find out what kind of entity is under the drone.
 *
 * returns `None` if the tile is empty, otherwise returns the type of the
 * entity under the drone.
 *
 * takes `1` tick to execute.
 * example usage:
 * ```
 * if get_entity_type() == Entities.Grass:
 *     harvest()
 * ```
 */
export function getEntityType(): Entity | None {
  return call("get_entity_type", [], "Entity | None") as any;
}

/**
 * Find out what kind of ground is under the drone.
 *
 * returns the type of the ground under the drone.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * if get_ground_type() != Grounds.Soil:
 *     till()
 * ```
 */
export function getGroundType(): Ground {
  return call("get_ground_type", [], "Ground");
}

/**
 * Get the current game time.
 *
 * returns the time in seconds since the start of the game.
 *
 * takes `1` tick to execute.
 * example usage:
 * ```
 * start = get_time()
 *
 * do_something()
 *
 * time_passed = get_time() - start
 * ```
 */
export function getTime(): Float {
  return call("get_time", [], "float");
}

/**
 * Used to measure the number of ticks performed.
 *
 * returns the number of ticks performed since the start of execution.
 *
 * takes `0` tick to execute.
 *
 * example usage:
 * ```
 * do_something()
 * print(get_tick_count())
 * ```
 */
export function getTickCount(): Int {
  return call("get_tick_count", [], "int");
}

/**
 * Attempts to use the specified `item` `n` times. Can only be used with some
 * items including `Items.Water`, `Items.Fertilizer` and
 * `Items.Weird_Substance`.
 *
 * returns `True` if an item was used, `False` if the item can't be used or you
 * don't have enough.
 *
 * takes `200` ticks to execute if it succeeded, `1` tick otherwise.
 *
 * example usage:
 * ```
 * if use_item(Items.Fertilizer):
 *     print("Fertilizer used successfully")
 * ```
 */
export function useItem(item: Item, n: Int = 1): Bool {
  return call("use_item", [item, n], "bool");
}

/**
 * Get the current water level under the drone.
 *
 * returns the water level under the drone as a number between `0` and `1`.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * if get_water() < 0.5:
 *     use_item(Items.Water)
 * ```
 */
export function getWater(): Float {
  return call("get_water", [], "float");
}

/**
 * Makes the drone do a flip! This action is not affected by speed upgrades.
 *
 * returns `None`
 *
 * takes 1s to execute.
 *
 * example usage:
 * ```
 * while True:
 *     do_a_flip()
 * ```
 */
export function doAFlip(): None {
  return call("do_a_flip", [], "None");
}

/**
 * Pets the piggy! This action is not affected by speed upgrades.
 *
 * returns * `None`
 *
 * takes 1s to execute.
 *
 * example usage:
 * ```
 * while True:
 *     pet_the_piggy()
 * ```
 */
export function petThePiggy(): None {
  return call("pet_the_piggy", [], "None");
}

/**
 * Prints `something` into the air above the drone using smoke. This action is
 * not affected by speed upgrades.
 * Multiple values can be printed at once.
 *
 * returns `None`
 *
 * takes 1s to execute.
 *
 * example usage:
 * ```
 * print('ground:', get_ground_type())
 * ```
 */
export function print(...args: Any[]): None {
  return call("print", args, "None");
}

/**
 * Limits the speed at which the program is executed to better see what's
 * happening.
 *
 * - A `speed` of `1` is the speed the drone has without any speed upgrades.
 * - A `speed` of `10` makes the code execute `10` times faster and corresponds
 *   to the speed of the drone after `9` speed upgrades.
 * - A `speed` of `0.5` makes the code execute at half of the speed without
 *   speed upgrades. This can be useful to see what the code is doing.
 *
 * If `speed` is faster than the execution can currently go it will just go at
 * max speed.
 *
 * If `speed` is `0` or negative, the speed is changed back to max speed. The
 * effect will also stop when the execution stops.
 *
 * returns `None`
 *
 * takes `200` ticks to execute.
 *
 * example usage:
 * ```
 * set_execution_speed(1)
 * ```
 */
export function setExecutionSpeed(speed: Float): None {
  return call("set_execution_speed", [speed], "None");
}

/**
 * Limits the size of the farm to better see what's happening.
 * Also clears the farm and resets the drone position.
 * - Sets the farm to a `size` x `size` grid.
 * - The smallest `size` possible is `3`.
 * - A `size` smaller than `3` will change the grid back to its full size.
 * - The effect will also stop when the execution stops.
 *
 * returns `None`
 *
 * takes `200` ticks to execute.
 *
 * example usage:
 * ```
 * set_world_size(5)
 * ```
 */
export function setWorldSize(size: Int): None {
  return call("set_world_size", [size], "None");
}

/**
 * Find out how much of `item` you currently have.
 *
 * returns the number of `item` currently in your inventory.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * if num_items(Items.Fertilizer) > 0:
 *    use_item(Items.Fertilizer)
 * ```
 */
export function numItems(item: Item): Float {
  return call("num_items", [item], "float");
}

/**
 * Gets the cost of a `thing`
 *
 * If `thing` is an entity: get the cost of planting it.
 * If `thing` is an unlock: get the cost of unlocking it at the specified
 * level.
 *
 * - returns a dictionary with items as keys and numbers as values. Each item
 *   is mapped to how much of it is needed.
 * - returns `None` for unlocks that are already unlocked (when no level
 *   specified).
 * - The optional `level` parameter specifies the upgrade level for unlocks.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * cost = get_cost(Unlocks.Carrots)
 * for item in cost:
 *     if num_items(item) < cost[item]:
 *         print('not enough items to unlock carrots')
 * ```
 */
export function getCost(entity: Entity): Dict<Item, Float>;
export function getCost(
  unlock: Unlock,
  level?: Int | None,
): Dict<Item, Float> | None;
export function getCost(
  thing: Entity | Unlock,
  level: Int | None = null,
): Dict<Item, Float> | None {
  return call("get_cost", [thing, level], "Dict[Item, float] | None") as any;
}

/**
 * Removes everything from the farm, moves the drone back to position `(0,0)`
 * and changes the hat back to the default.
 *
 * returns `None`
 *
 * takes `200` ticks to execute.
 *
 * example usage:
 * ```
 * clear()
 * ```
 */
export function clear(): None {
  return call("clear", [], "None");
}

/**
 * Get the companion preference of the plant under the drone.
 *
 * returns a tuple of the form `(companion_type, (companion_x_position,
 * companion_y_position))` or `None` if there is no companion.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * companion = get_companion()
 * if companion != None:
 *   plant_type, (x, y) = companion
 *   print("Companion:", plant_type, "at", x, ",", y)
 * ```
 */
export function getCompanion(): Tuple<Entity, Tuple<Int, Int>> | None {
  return call(
    "get_companion",
    [],
    "Tuple[Entity, Tuple[int, int]] | None",
  ) as any;
}

/**
 * Has exactly the same effect as clicking the button corresponding to `unlock`
 * in the research tree.
 *
 * returns `True` if the unlock was successful, `False` otherwise.
 *
 * takes `200` ticks to execute if it succeeded, `1` tick otherwise.
 *
 * example usage:
 * ```
 * unlock(Unlocks.Carrots)
 * ```
 */
export function unlock(unlock: Unlock): Bool {
  return call("unlock", [unlock], "bool");
}

/**
 * Used to check if an unlock, entity, ground, item or hat is already unlocked.
 *
 * returns `1` plus the number of times `thing` has been upgraded if `thing` is
 * upgradable. Otherwise returns `1` if `thing` is unlocked, `0` otherwise.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * if num_unlocked(Unlocks.Carrots) > 0:
 *     plant(Entities.Carrot)
 * else:
 *     print("Carrots not unlocked yet")
 * ```
 */
export function numUnlocked(thing: Unlock | Entity | Ground | Item): Int {
  return call("num_unlocked", [thing], "int");
}

/**
 * Can measure some values on some entities. The effect of this depends on the
 * entity.
 *
 * overloads:
 * `measure()`: measures the entity under the drone.
 * `measure(direction)`: measures the neighboring entity in the `direction` of
 * the drone.
 *
 * Sunflower: returns the number of petals.
 * Maze: returns the position of the current treasure from anywhere in the maze.
 * Cactus: returns the size.
 * Dinosaur: returns the number corresponding to the type.
 * All other entities: returns `None`.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * num_petals = measure()
 * treasure_pos = measure()  # Works anywhere in maze
 * ```
 */
export function measure(direction: Direction): Float | Tuple<Int, Int> | None {
  return call("measure", [direction], "float | Tuple[int, int] | None") as any;
}

/**
 * Starts a timed run for the `leaderboard` using the specified `file_name` as
 * a starting point.
 *
 * `speedup` sets the starting speedup.
 *
 * returns `None`
 *
 * takes `200` ticks to execute.
 *
 * example usage:
 * ```
 * leaderboard_run(Leaderboards.Fastest_Reset, "full_run", 256)
 * ```
 */
export function leaderboardRun({
  leaderboard,
  fileName,
  speedup,
}: {
  leaderboard: Leaderboard;
  fileName: Str;
  speedup: Float;
}): None {
  return call("leaderboard_run", [leaderboard, fileName, speedup], "None");
}

/**
 * Starts a simulation for the leaderboard using the specified `file_name` as a
 * starting point.
 *
 * `sim_unlocks`: A sequence containing the starting unlocks.
 *
 * `sim_items`: A dict mapping items to amounts. The simulation starts with
 * these items.
 *
 * `sim_globals`: A dict mapping variable names to values. The simulation
 * starts with these variables in the global scope.
 *
 * `seed`: The random seed of the simulation. Must be a positive integer.
 *
 * `speedup`: The starting speedup.
 *
 * returns the time it took to run the simulation.
 *
 * takes `200` ticks to execute.
 *
 * example usage:
 * ```
 * filename = "f1"
 * sim_unlocks = Unlocks
 * sim_items = {Items.Carrot : 10000, Items.Hay : 50}
 * sim_globals = {"a" : 13}
 * seed = 0
 * speedup = 64
 * run_time = simulate(filename, sim_unlocks, sim_items, sim_globals, seed, speedup)
 * ```
 */
export function simulate({
  fileName,
  unlocks,
  items,
  globals,
  seed,
  speedup,
}: {
  fileName: Str;
  unlocks: Dict<Unlock, Float>;
  items: Dict<Item, Float>;
  globals: Dict<Str, Any>;
  seed: Int;
  speedup: Float;
}): Float {
  return call(
    "simulate",
    [fileName, unlocks, items, globals, seed, speedup],
    "float",
  );
}

/**
 * Prints a value just like `print()` but it doesn't stop to write it into the
 * air so it can only be found on the output page.
 *
 * returns `None`
 *
 * takes `0` ticks to execute.
 *
 * example usage:
 * ```
 * quick_print('hi mom')
 * ```
 */
export function quickPrint(...args: Any[]): None {
  return call("quick_print", args, "None");
}

/**
 * Samples a random number between 0 (inclusive) and 1 (exclusive).
 *
 * returns the random number.
 *
 * takes `1` ticks to execute.
 *
 * example usage:
 * ```
 * def random_elem(list):
 *     index = random() * len(list) // 1
 *     return list[index]
 * ```
 */
export function random(): Float {
  return call("random", [], "float");
}

/**
 * Returns the number of items in an object.
 *
 * returns the length of the object.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * my_list = [1, 2, 3]
 * length = len(my_list)  # 3
 * ```
 */
export function len(obj: Any): Int {
  return call("len", [obj], "int");
}

/**
 * Returns a sequence of numbers from start (inclusive) to stop (exclusive).
 *
 * returns a range object.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * for i in range(5):
 *     print(i)  # 0, 1, 2, 3, 4
 * ```
 */
export function range(
  start: Int,
  stop: Int | None = null,
  step: Int = 1,
): List<Int> {
  return call("range", [start, stop, step], "List[int]");
}

/**
 * Converts an object to its string representation.
 *
 * returns the string representation of the object.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * string = str(1000)
 * print(string)  # prints "1000"
 * ```
 */
export function str(obj: Any): Str {
  return call("str", [obj], "str");
}

/**
 * Gets the minimum of a sequence of elements or several passed arguments.
 * Can be used on numbers and strings.
 *
 * `min(a,b,c)`: Returns the minimum of `a`, `b` and `c`.
 * `min(sequence)`: Returns the minimum of all values in a sequence.
 *
 * returns the minimum value from the arguments.
 *
 * takes #comparisons ticks to execute.
 *
 * example usage:
 * ```
 * smallest = min(1, 5, 3, 2)
 * smallest_from_list = min([3, 6, 34, 16])
 * ```
 */
export function min(arg: List<Int>): Int;
export function min(...args: Int[]): Int;
export function min(arg: List<Str>): Str;
export function min(...args: Str[]): Str;
export function min(...args: Any[]): Any {
  return call("min", args, "Any");
}

/**
 * Gets the maximum of a sequence of elements or several passed arguments.
 * Can be used on numbers and strings.
 *
 * `max(a,b,c)`: Returns the maximum of `a`, `b` and `c`.
 * `max(sequence)`: Returns the maximum of all values in a sequence.
 *
 * returns the maximum value from the arguments.
 *
 * takes #comparisons ticks to execute.
 *
 * example usage:
 * ```
 * largest = max(1, 5, 3, 2)
 * largest_from_list = max([3, 6, 34, 16])
 * ```
 */
export function max(arg: List<Int>): Int;
export function max(...args: Int[]): Int;
export function max(arg: List<Str>): Str;
export function max(...args: Str[]): Str;
export function max(...args: Any[]): Any {
  return call("min", args, "Any");
}

/**
 * Returns the absolute value of a number.
 *
 * returns the absolute value of x.
 *
 * takes `1` tick to execute.
 *
 * example usage:
 * ```
 * positive = abs(-5)
 * print(positive)  # prints 5
 * ```
 */
export function abs(x: Int): Int;
export function abs(x: Float): Float;
export function abs(x: Int | Float): Int | Float {
  return call("abs", [x], "int | float") as any;
}

/**
 * Changes the hat of the drone to the specified `hat`.
 *
 * returns `None`
 *
 * takes `200` ticks to execute.
 *
 * example usage:
 * ```
 * change_hat(Hats.Dinosaur_Hat)
 * ```
 */
export function changeHat(hat: Hat): None {
  return call("change_hat", [hat], "None");
}

/**
 * Spawns a new drone in the same position as the drone that ran the
 * `spawn_drone(function)` command. The new drone then begins executing the
 * specified function. After it is done, it will disappear automatically.
 *
 * returns the handle of the new drone or `None` if all drones are already
 * spawned.
 *
 * takes `200` ticks to execute if a drone was spawned, `1` otherwise.
 *
 * example:
 * ```
 * def harvest_column():
 *     for _ in range(get_world_size()):
 *         harvest()
 *         move(North)
 *
 * while True:
 *     if spawn_drone(harvest_column):
 *         move(East)
 * ```
 */
export function spawnDrone(fn: Any): Int | None {
  return call("spawn_drone", [fn], "int | None") as any;
}

/**
 * Waits until the given drone terminates.
 *
 * returns the return value of the function that the drone was running.
 *
 * takes `1` tick to execute if the awaited drone is already done.
 *
 * example:
 * ```
 * def get_entity_type_in_direction(dir):
 *     move(dir)
 *     return get_entity_type()
 *
 * def zero_arg_wrapper():
 *     return get_entity_type_in_direction(North)
 * handle = spawn_drone(zero_arg_wrapper)
 * print(wait_for(handle))
 * ```
 */
export function waitFor(drone: Int): Any {
  return call("wait_for", [drone], "Any");
}

/**
 * Checks if the given drone has finished.
 *
 * returns `True` if the drone has finished, `False` otherwise.
 *
 * takes `1` tick to execute.
 *
 * example:
 * ```
 * drone = spawn_drone(function)
 * while not has_finished(drone):
 *     do_something_else()
 * result = wait_for(drone)
 * ```
 */
export function hasFinished(drone: Int): Bool {
  return call("has_finished", [drone], "bool");
}

/**
 * returns the maximum number of drones that you can have in the farm.
 *
 * takes `1` tick to execute.
 *
 * example:
 * ```
 * while num_drones() < max_drones():
 *     spawn_drone("some_file_name")
 *     move(East)
 * ```
 */
export function maxDrones(): Int {
  return call("max_drones", [], "int");
}

/**
 * returns the number of drones currently in the farm.
 *
 * takes `1` tick to execute.
 *
 * example:
 * ```
 * while num_drones() < max_drones():
 *     spawn_drone("some_file_name")
 *     move(East)
 * ```
 */
export function numDrones(): Int {
  return call("num_drones", [], "int");
}
