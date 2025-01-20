import * as esbuild from "esbuild";
import * as sass from "sass-embedded";
import fs from "node:fs";
import { mkdirs } from "./utils.js";

mkdirs("src/dist");

const result = sass.compile(
    "src/assets/stylesheets/main.scss", {
        style: "compressed",
    });
fs.writeFileSync("src/dist/index.css", result.css.toString());

await esbuild.build({
    entryPoints: [ "src/assets/javascripts/main.ts" ],
    bundle: true,
    minify: true,
    outfile: 'src/dist/index.js',
});
