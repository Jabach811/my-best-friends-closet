import { readFile, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const shopHtml = await readFile(resolve(root, "shop.html"), "utf8");

const cards = [...shopHtml.matchAll(
  /<li data-group="([^"]*)" data-price="([^"]*)" data-name="[^"]*" data-index="\d+">\s*<a[^>]*href="product\.html\?p=([^"]+)"/g
)];

const seen = new Set();
const items = [];
for (const [, group, price, handle] of cards) {
  if (seen.has(handle)) continue;
  seen.add(handle);
  items.push({ handle, group: group.replace(/&amp;/g, "&"), price: Number(price) });
}

if (!items.length) {
  console.error("No product links found in shop.html — nothing to refresh, leaving products.json alone.");
  process.exit(1);
}
console.log(`${items.length} products listed in shop.html`);

const strip = (s) => (s || "")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, " ")
  .trim();

const paragraphs = (desc) => (desc || "")
  .split(/<\/p>|<br\s*\/?>|<\/li>|<\/h[1-6]>|<\/div>/i)
  .map(strip)
  .filter((t) => t.length > 2);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// a network hiccup shouldn't wipe an item off the site — fall back to what we already had
const previous = new Map();
try {
  const old = JSON.parse(await readFile(resolve(root, "products.json"), "utf8"));
  for (const p of old) previous.set(p.handle, p);
} catch {}

// the store rate-limits, so back off and retry rather than dropping the item
async function grab(item) {
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt) await wait(1500 * attempt);
    let res;
    try {
      res = await fetch(`https://mbfctracy.com/products/${item.handle}.js`, { headers: { accept: "application/json" } });
    } catch {
      continue;
    }
    if (res.status === 404) return { gone: item.handle };
    if (!res.ok) continue;
    const d = await res.json();
    const lines = paragraphs(d.description);
    return {
      product: {
        handle: item.handle,
        group: item.group,
        title: d.title,
        vendor: d.vendor || "",
        price: (d.price ?? item.price * 100) / 100,
        available: d.available,
        images: (d.images || []).map((u) => (u.startsWith("//") ? `https:${u}` : u)),
        sizes: (d.variants || []).map((v) => ({ name: v.title, available: v.available })),
        blurb: lines[0] || "",
        body: lines.slice(1, 14),
        url: `https://mbfctracy.com/products/${item.handle}`,
      },
    };
  }
  return { failed: item.handle };
}

const products = [];
const gone = [];
const failed = [];
const queue = [...items];
let done = 0;

await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) {
    const item = queue.shift();
    const result = await grab(item);
    if (result.product) products.push(result.product);
    else if (result.gone) gone.push(result.gone);
    else {
      failed.push(result.failed);
      if (previous.has(result.failed)) products.push(previous.get(result.failed));
    }
    if (++done % 25 === 0) console.log(`  ${done}/${items.length}`);
    await wait(120);
  }
}));

if (failed.length > items.length * 0.2) {
  console.error(`${failed.length} of ${items.length} failed to load — that looks like a network problem, not a sold-out rack.`);
  console.error("products.json was left untouched. Try again in a few minutes.");
  process.exit(1);
}

const order = new Map(items.map((i, n) => [i.handle, n]));
products.sort((a, b) => order.get(a.handle) - order.get(b.handle));
const json = JSON.stringify(products);
// a script tag works when the page is opened straight off disk; fetching a .json file does not
const script = `window.MBFC_PRODUCTS = ${json};\n`;
await writeFile(resolve(root, "products.json"), json, "utf8");
await writeFile(resolve(root, "products-data.js"), script, "utf8");
// drop them straight into the served copy too; restaging would delete public/ out from under a running dev server
try {
  await access(resolve(root, "public"));
  await writeFile(resolve(root, "public/products.json"), json, "utf8");
  await writeFile(resolve(root, "public/products-data.js"), script, "utf8");
} catch {}

const soldOut = products.filter((p) => !p.available).length;
console.log(`\nWrote ${products.length} products to products.json`);
console.log(`  ${soldOut} marked sold out`);
console.log(`  ${gone.length} no longer in the store (they will show "this one found a home")`);
if (gone.length) console.log(gone.map((h) => `    ${h}`).join("\n"));
if (failed.length) console.log(`  ${failed.length} could not be reached and kept their old details:\n${failed.map((h) => `    ${h}`).join("\n")}`);
