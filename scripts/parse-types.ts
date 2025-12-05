import * as fs from "node:fs/promises";
import * as path from "node:path";
import { parseBuiltins } from "../src/parser/index.js";
import { builtins as builtinsPath, repoDir } from "./paths.js";

const builtins = await fs.readFile(path.join(repoDir, builtinsPath), "utf-8");
const typesDir = path.resolve(repoDir, "..", "src", "types");

for (const { filename, content } of parseBuiltins(builtins)) {
  await fs.writeFile(path.join(typesDir, filename), content);
}
