import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
sharp.concurrency(2);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public/uploads/optimized");
await fs.mkdir(output, { recursive: true });
const refs = new Set();
function collect(value) {
  if (typeof value === "string" && /^\/uploads\/[^?#]+\.(png|jpe?g|webp|gif)$/i.test(value)) refs.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
}
for (const name of ["projects.json", "about.json"]) collect(JSON.parse(await fs.readFile(path.join(root, "data", name), "utf8")));
let previous = {};
try { previous = JSON.parse(await fs.readFile(path.join(root, "data/media-assets.json"), "utf8")); } catch {}
const manifest = {};
const converted = new Map();
let before = 0, after = 0, animations = 0, missing = 0;
for (const src of [...refs].sort()) {
  let filename = path.join(root, "public", src);
  if (src.endsWith(".preview.webp")) {
    const full = filename.replace(/\.preview\.webp$/, ".full.webp");
    try { await fs.access(full); filename = full; } catch {}
  }
  let bytes;
  try { bytes = await fs.readFile(filename); } catch { console.warn("Missing source:", src); missing++; continue; }
  const hash = crypto.createHash("sha256").update(bytes).update("artist-media-v1").digest("hex").slice(0, 16);
  if (converted.has(hash)) { manifest[src] = converted.get(hash); continue; }
  const metadata = await sharp(bytes, { animated: true }).metadata();
  const animated = (metadata.pages || 1) > 1;
  const rotated = !animated && metadata.orientation >= 5;
  const width = rotated ? metadata.height : metadata.width, height = rotated ? metadata.width : metadata.pageHeight || metadata.height;
  const existing = previous[src];
  if (existing?.hash === hash && await Promise.all([existing.full, ...existing.variants.map(v => v.src)].map(url => fs.access(path.join(root, "public", url)).then(() => true, () => false))).then(all => all.every(Boolean))) {
    const fullPath = path.join(root, "public", existing.full);
    const originalUrl = "/" + path.relative(path.join(root, "public"), filename).split(path.sep).join("/");
    const full = (await fs.stat(fullPath)).size > bytes.length ? originalUrl : existing.full;
    const fullWidth = (await sharp(path.join(root, "public", full)).metadata()).width;
    const cached = { ...existing, width, height, full, fullWidth };
    manifest[src] = cached; converted.set(hash, cached); continue;
  }
  const variants = [];
  // Animated versions retain every frame, alpha, delays and loop metadata.
  const widths = animated ? [480, 960] : [384, 768, 1280];
  for (const target of widths) {
    if (variants.length && width <= variants[variants.length - 1].width) break;
    const actual = Math.min(target, width);
    const name = `${hash}-${actual}.webp`;
    const url = `/uploads/optimized/${name}`;
    const dest = path.join(output, name);
    const encoded = await sharp(bytes, { animated }).rotate().resize({ width: actual, withoutEnlargement: true }).webp({ quality: animated ? 76 : 80, effort: 4 }).toBuffer();
    await fs.writeFile(dest, encoded);
    variants.push({ src: url, width: actual });
  }
  const name = `${hash}-full.webp`;
  const fullBytes = await sharp(bytes, { animated }).rotate().resize({ width: animated ? 1280 : 2560, height: animated ? 1280 : 2560, fit: "inside", withoutEnlargement: true }).webp({ quality: animated ? 82 : 86, effort: 4 }).toBuffer();
  await fs.writeFile(path.join(output, name), fullBytes);
  const originalUrl = "/" + path.relative(path.join(root, "public"), filename).split(path.sep).join("/");
  const fullWidth = fullBytes.length < bytes.length ? (await sharp(fullBytes).metadata()).width : width;
  const asset = { hash, width, height, animated, full: fullBytes.length < bytes.length ? `/uploads/optimized/${name}` : originalUrl, fullWidth, variants };
  manifest[src] = asset; converted.set(hash, asset);
  before += bytes.length; after += fullBytes.length; if (animated) animations++;
}
await fs.writeFile(path.join(root, "data/media-assets.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ assets: Object.keys(manifest).length, generated: converted.size, animations, missing, sourceMB: +(before / 1048576).toFixed(2), fullMB: +(after / 1048576).toFixed(2) }));
