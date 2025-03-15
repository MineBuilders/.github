import fs from "node:fs";
import crypto from "node:crypto";
import { copy, exec, mkdirs } from "./utils.js";

await exec("npm run clear");
await exec("npm run build");

mkdirs("build/dist");

const getHash = (path) => crypto.createHash('sha256')
    .update(fs.readFileSync(path)).digest('hex').slice(0, 6);
const [jsHash, cssHash] = ['js', 'css']
    .map(ext => [getHash(`src/dist/index.${ext}`), ext])
    .map(([hash, ext]) => `dist/index.${hash}.${ext}`);
copy('src/dist/index.js', 'build/' + jsHash);
copy('src/dist/index.css', 'build/' + cssHash);

const html = fs.readFileSync('src/index.html', 'utf8')
    .replace('dist/index.js', jsHash)
    .replace('dist/index.css', cssHash);
fs.writeFileSync('build/index.html', html);

['images', 'models', 'fonts']
    .map(dir => [`src/assets/${dir}`, `build/assets/${dir}`])
    .forEach(dirs => fs.cpSync(dirs[0], dirs[1], { recursive: true }));
