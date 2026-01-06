import * as F from "./types/index.js";
import { printProgram } from "./print.js";

const program = [F.move(F.Directions.North)];

console.log(printProgram(program));
