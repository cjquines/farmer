import * as os from "node:os";
import * as path from "node:path";
import * as url from "node:url";

export const steamDir = path.join(
  os.homedir(),
  ".local/share/Steam/steamapps/compatdata",
  "2060160",
  "pfx",
  "drive_c/users/steamuser/AppData/LocalLow/TheFarmerWasReplaced/TheFarmerWasReplaced/Saves",
  "post-1.0",
);

export const repoDir = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
  "save",
);

export const builtins = "__builtins__.py";
