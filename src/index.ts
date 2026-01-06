import * as F from "./types/index.js";
import { printProgram } from "./print.js";

function traverseGrid(
  size: number,
  callback: (x: number, y: number) => Iterable<F.AnyPythonType>,
): F.AnyPythonType[] {
  const result: F.AnyPythonType[] = [];

  let x = 0;
  let y = 0;

  const move = (direction: F.Direction) => {
    result.push(F.move(direction));
    switch (direction) {
      case F.Directions.North:
        y += 1;
        break;
      case F.Directions.East:
        x += 1;
        break;
      case F.Directions.South:
        y -= 1;
        break;
      case F.Directions.West:
        x -= 1;
        break;
    }
    x = (x + size) % size;
    y = (y + size) % size;
  };

  // Go North `size - 1` times, then East once,
  // then South `size - 1` times, then East again, etc.
  // If `size` is odd, we have to do this twice.
  const easts = size % 2 === 1 ? 2 * size : size;

  for (let i = 0; i < easts; i++) {
    for (let j = 0; j < size - 1; j++) {
      result.push(...callback(x, y));
      move(i % 2 === 0 ? F.Directions.North : F.Directions.South);
    }
    result.push(...callback(x, y));
    move(F.Directions.East);
  }

  return result;
}

const program = traverseGrid(3, (x, y) => [F.print(x, y)]);

console.log(printProgram(program));
