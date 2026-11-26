/** @typedef {{ width: number; height: number }} DimensionEntry */

export const PHOTO_WIDTHS = [480, 960, 1600, 2400];

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|tiff?|heic|mpo)$/i;

function stemOf(basename) {
  return basename.replace(/\.[^.]+$/i, "");
}

/**
 * @param {string} key
 * @returns {{ slug: string; stem: string; lookupKey: string } | null}
 */
export function normalizeImageKey(key) {
  if (!key || typeof key !== "string") return null;
  if (/^https?:\/\//i.test(key)) return null;
  if (key.startsWith("/")) return null;
  if (
    key.includes("__forms") ||
    key.includes("admin/config") ||
    key.includes("favicon")
  ) {
    return null;
  }

  const parts = key.split("/");
  if (parts.length === 2) {
    const [slug, basename] = parts;
    if (!slug || !IMAGE_EXT.test(basename)) return null;
    return { slug, stem: stemOf(basename), lookupKey: key };
  }
  if (parts.length === 3 && parts[1] === "thumb") {
    const [slug, , basename] = parts;
    if (!slug || !IMAGE_EXT.test(basename)) return null;
    return { slug, stem: stemOf(basename), lookupKey: `${slug}/${basename}` };
  }
  return null;
}

/** @param {number | undefined} intrinsicWidth */
export function largestVariantWidth(intrinsicWidth) {
  if (!intrinsicWidth) {
    return PHOTO_WIDTHS[PHOTO_WIDTHS.length - 1];
  }
  const allowed = PHOTO_WIDTHS.filter((w) => w <= intrinsicWidth);
  return allowed[allowed.length - 1] ?? PHOTO_WIDTHS[0];
}

/**
 * @param {string} key
 * @param {Record<string, DimensionEntry>} dims
 */
export function legacyRedirectTarget(key, dims) {
  const parsed = normalizeImageKey(key);
  if (!parsed) return null;
  const intrinsic = dims[parsed.lookupKey]?.width;
  const w = largestVariantWidth(intrinsic);
  return `/photos/${parsed.slug}/${parsed.stem}-w${w}.webp`;
}

/**
 * @param {string} key
 */
export function isRedirectableImageKey(key) {
  return normalizeImageKey(key) !== null;
}