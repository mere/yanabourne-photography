#!/usr/bin/env node
/**
 * Run on the Hetzner server (not in CI). Reads originals, writes web variants + dimensions manifest.
 *
 * Defaults:
 *   ORIGINALS_ROOT=/srv/yanabourne/photos/originals
 *   WEB_ROOT=/srv/yanabourne/photos/web
 *   MANIFEST=./src/data/photo-dimensions.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WIDTHS = [480, 960, 1600, 2400];
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const ORIGINALS_ROOT =
  process.env.ORIGINALS_ROOT || "/srv/yanabourne/photos/originals";
const WEB_ROOT = process.env.WEB_ROOT || "/srv/yanabourne/photos/web";
const MANIFEST =
  process.env.MANIFEST ||
  path.join(repoRoot, "src/data/photo-dimensions.json");

const IMAGE_EXT = /\.(jpe?g|png|tiff?|webp|heic|mpo)$/i;

function stemOf(filename) {
  return filename.replace(/\.[^.]+$/i, "");
}

async function processFile(slug, filename) {
  const key = `${slug}/${filename}`;
  const inputPath = path.join(ORIGINALS_ROOT, slug, filename);
  if (!fs.existsSync(inputPath)) {
    console.warn(`Missing original: ${inputPath}`);
    return null;
  }

  const outDir = path.join(WEB_ROOT, slug);
  fs.mkdirSync(outDir, { recursive: true });
  const stem = stemOf(filename);

  const image = sharp(inputPath, { failOn: "none" });
  const meta = await image.metadata();
  const intrinsicWidth = meta.width ?? 0;
  const intrinsicHeight = meta.height ?? 0;

  for (const w of WIDTHS) {
    if (intrinsicWidth && w > intrinsicWidth) continue;
    const outName = `${stem}-w${w}.webp`;
    const outPath = path.join(outDir, outName);
    if (fs.existsSync(outPath)) continue;
    await sharp(inputPath)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);
    console.log(`Wrote ${outPath}`);
  }

  // Smallest fallback JPEG for very old browsers (optional, idempotent)
  const jpegPath = path.join(outDir, `${stem}-w480.jpg`);
  if (!fs.existsSync(jpegPath)) {
    await sharp(inputPath)
      .rotate()
      .resize({ width: 480, withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(jpegPath);
  }

  return {
    key,
    width: intrinsicWidth,
    height: intrinsicHeight,
  };
}

async function main() {
  if (!fs.existsSync(ORIGINALS_ROOT)) {
    console.error(`Originals directory not found: ${ORIGINALS_ROOT}`);
    process.exit(1);
  }

  const manifest = {};
  const slugs = fs
    .readdirSync(ORIGINALS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const slug of slugs) {
    const dir = path.join(ORIGINALS_ROOT, slug);
    const files = fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f));
    for (const filename of files) {
      const result = await processFile(slug, filename);
      if (result?.width && result.height) {
        manifest[result.key] = {
          width: result.width,
          height: result.height,
        };
      }
    }
  }

  // Merge with existing manifest (preserve keys not present on disk this run)
  let existing = {};
  if (fs.existsSync(MANIFEST)) {
    existing = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  }
  const merged = { ...existing, ...manifest };
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(merged, null, 2) + "\n");
  console.log(
    `Manifest updated: ${MANIFEST} (${Object.keys(merged).length} entries)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});