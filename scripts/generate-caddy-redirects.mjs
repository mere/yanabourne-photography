#!/usr/bin/env node
/**
 * Generate Caddy legacy image redirect config for /api/get-raw-image?key=...
 * Uses query matchers via map {query.key} (path matchers ignore query strings).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  isRedirectableImageKey,
  legacyRedirectTarget,
} from "./photo-urls.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const defaultMapping = path.join(repoRoot, "deploy/url-mapping.json");
const fallbackMapping =
  "/home/ubuntu/.cursor/projects/workspace/uploads/url-mapping_7a35.json";

const mappingPath = fs.existsSync(defaultMapping)
  ? defaultMapping
  : fs.existsSync(fallbackMapping)
    ? fallbackMapping
    : process.argv[2];

if (!mappingPath || !fs.existsSync(mappingPath)) {
  console.error(
    "url-mapping not found. Provide path as argv[2] or add deploy/url-mapping.json",
  );
  process.exit(1);
}

const dimensionsPath = path.join(repoRoot, "src/data/photo-dimensions.json");
const dimensions = JSON.parse(fs.readFileSync(dimensionsPath, "utf8"));

const mapping = JSON.parse(fs.readFileSync(mappingPath, "utf8"));
/** @type {Map<string, string>} */
const redirects = new Map();
let skipped = 0;

for (const row of mapping) {
  const keys = [row.old_imageUrl, row.thumbKey].filter(Boolean);
  for (const key of keys) {
    if (!isRedirectableImageKey(key)) {
      if (row.old_imageUrl === key) skipped++;
      continue;
    }
    const target = legacyRedirectTarget(key, dimensions);
    if (target) redirects.set(key, target);
  }
}

const lines = [
  "# Auto-generated legacy image redirects — regenerate with: npm run generate-redirects",
  "# Matches /api/get-raw-image with query param key (path-only redir lines do not work).",
  "",
  "map {query.key} {legacy_photo_redirect} {",
  '\tdefault ""',
];

const sortedKeys = [...redirects.keys()].sort();
for (const key of sortedKeys) {
  const target = redirects.get(key);
  lines.push(`\t${key} ${target}`);
}

lines.push(
  "}",
  "",
  "handle /api/get-raw-image {",
  "\t@mapped expression {legacy_photo_redirect} != \"\"",
  "\thandle @mapped {",
  "\t\tredir {legacy_photo_redirect} permanent",
  "\t}",
  "\trespond \"Not found\" 404",
  "}",
  "",
);

const out = path.join(repoRoot, "deploy/legacy-image-redirects.caddy");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join("\n"));
console.log(
  `Wrote ${redirects.size} map entries (${skipped} rows skipped) to ${out}`,
);