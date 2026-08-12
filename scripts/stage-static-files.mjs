import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const publicDirectory = resolve(root, "public");
const stagedFiles = [
  { source: "index-v2.html", destination: "index.html" },
  { source: "index-v2.html", destination: "index-v2.html" },
  { source: "shop.html", destination: "shop.html" },
  { source: "consign.html", destination: "consign.html" },
  { source: "jewelry.html", destination: "jewelry.html" },
  { source: "hats.html", destination: "hats.html" },
  { source: "pitch.html", destination: "pitch.html" },
  { source: "404.html", destination: "404.html" },
  { source: "styles.css", destination: "styles.css" },
  { source: "site.js", destination: "site.js" },
  { source: "shop.js", destination: "shop.js" },
  { source: "qr-rebuild.svg", destination: "qr-rebuild.svg" },
];

await rm(publicDirectory, { recursive: true, force: true });
await mkdir(publicDirectory, { recursive: true });

await Promise.all(stagedFiles.map(({ source, destination }) => cp(resolve(root, source), resolve(publicDirectory, destination))));
await cp(resolve(root, "assets"), resolve(publicDirectory, "assets"), { recursive: true });
