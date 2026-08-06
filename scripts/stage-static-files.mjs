import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const publicDirectory = resolve(root, "public");
const sourceFiles = ["index.html", "shop.html", "pitch.html", "styles.css"];

await rm(publicDirectory, { recursive: true, force: true });
await mkdir(publicDirectory, { recursive: true });

await Promise.all(sourceFiles.map((file) => cp(resolve(root, file), resolve(publicDirectory, file))));
await cp(resolve(root, "assets"), resolve(publicDirectory, "assets"), { recursive: true });
