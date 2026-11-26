#!/usr/bin/env node
/**
 * Generate Caddy redirect snippets for legacy /api/get-raw-image URLs.
 * Reads url-mapping JSON (from backup) and writes deploy/legacy-image-redirects.caddy
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mappingPath =
  process.argv[2] ||
  path.join(__dirname, "../../uploads/url-mapping_7a35.json");

const fallback = "/home/ubuntu/.cursor/projects/workspace/uploads/url-mapping_7a35.json";
const resolved = fs.existsSync(mappingPath) ? mappingPath : fallback;

const mapping = JSON.parse(fs.readFileSync(resolved, "utf8"));
const lines = [
  "# Auto-generated legacy image redirects — regenerate with: npm run generate-redirects",
  "",
];

for (const row of mapping) {
  const key = row.old_imageUrl;
  if (!key || !key.includes("/")) continue;
  const slash = key.indexOf("/");
  const slug = key.slice(0, slash);
  const basename = key.slice(slash + 1);
  const stem = basename.replace(/\.[^.]+$/i, "");
  const target = `/photos/${slug}/${stem}-w2400.webp`;
  const encodedKey = encodeURIComponent(key);
  lines.push(
    `redir /api/get-raw-image?key=${encodedKey} ${target} permanent`,
  );
}

const out = path.join(__dirname, "../deploy/legacy-image-redirects.caddy");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join("\n") + "\n");
console.log(`Wrote ${lines.length - 2} redirects to ${out}`);