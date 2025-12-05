import * as fs from "node:fs/promises";
import * as path from "node:path";
import { repoDir, builtins as builtinsPath } from "../src/paths.js";

const builtins = await fs.readFile(path.join(repoDir, builtinsPath), "utf-8");
const typesDir = path.resolve(repoDir, "..", "src", "types");

// TODO: Parse builtins to files in typesDir.
