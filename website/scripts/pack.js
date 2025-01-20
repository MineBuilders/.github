import { copy, exec, mkdirs } from "./utils.js";

await exec("npm run clear");
await exec("npm run build");

mkdirs("build/dist");
copy("src/index.html", "build/index.html");
copy("src/dist/index.js", "build/dist/index.js");
copy("src/dist/index.css", "build/dist/index.css");
