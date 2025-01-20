import fs from "node:fs";
import { copy, exec, mkdirs } from "./utils.js";

await exec("npm run clear");
await exec("npm run build");

mkdirs("build/dist");
copy("src/index.html", "build/index.html");
copy("src/dist/index.js", "build/dist/index.js");
copy("src/dist/index.css", "build/dist/index.css");
fs.cp("src/assets/images", "build/assets/images", { recursive: true }, () => {});
fs.cp("src/assets/models", "build/assets/models", { recursive: true }, () => {});
