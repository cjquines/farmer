import * as fs from "node:fs/promises";
import * as path from "node:path";
import { builtins, repoDir, steamDir } from "./paths.js";

await fs.copyFile(path.join(steamDir, builtins), path.join(repoDir, builtins));

for (const file of await fs.readdir(repoDir)) {
  if (file !== "__builtins__.py") {
    await fs.copyFile(path.join(repoDir, file), path.join(steamDir, file));
  }
}
