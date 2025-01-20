import { exec as _exec } from "node:child_process";
import fs from "node:fs";
import paths from "node:path";

export const exec = command => new Promise((resolve, reject) =>
    _exec(command, (error, stdout, stderr) =>
        error ? reject(error) : resolve(stdout + stderr))
);

export const mkdirs = (path) => !fs.existsSync(path) && fs.mkdirSync(path, { recursive: true });

export const copy = (from, to) => fs.createReadStream(from).pipe(fs.createWriteStream(to));

export function del(path) {
    if (!fs.existsSync(path)) return;
    if (fs.lstatSync(path).isFile()) return fs.unlinkSync(path);
    fs.readdirSync(path)
        .map(name => paths.resolve(path, name))
        .forEach(del);
    fs.rmdirSync(path);
}
