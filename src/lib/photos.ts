import dimensions from '../data/photo-dimensions.json';

export const PHOTO_WIDTHS = [480, 960, 1600, 2400] as const;

type DimensionEntry = { width: number; height: number };

const dims = dimensions as Record<string, DimensionEntry>;

/** Blob-style key, e.g. `home/1749304839237-1okp2q9lhbo-l1001893.jpg` */
export function parseImageKey(imageKey: string): { slug: string; basename: string; stem: string } | null {
  if (!imageKey) return null;
  const slash = imageKey.indexOf('/');
  if (slash === -1) return null;
  const slug = imageKey.slice(0, slash);
  const basename = imageKey.slice(slash + 1);
  const stem = basename.replace(/\.[^.]+$/i, '');
  return { slug, basename, stem };
}

export function photoVariantPath(imageKey: string, width: number): string {
  const parsed = parseImageKey(imageKey);
  if (!parsed) return '';
  return `/photos/${parsed.slug}/${parsed.stem}-w${width}.webp`;
}

export function photoSrcSet(imageKey: string): string {
  const parsed = parseImageKey(imageKey);
  if (!parsed) return '';

  const intrinsic = dims[imageKey];
  return PHOTO_WIDTHS.filter((w) => !intrinsic || w <= intrinsic.width)
    .map((w) => `${photoVariantPath(imageKey, w)} ${w}w`)
    .join(', ');
}

export function defaultPhotoSrc(imageKey: string, targetWidth = 960): string {
  const parsed = parseImageKey(imageKey);
  if (!parsed) return '';
  const intrinsic = dims[imageKey];
  let width = targetWidth;
  if (intrinsic) {
    const allowed = PHOTO_WIDTHS.filter((w) => w <= intrinsic.width);
    width = allowed.find((w) => w >= targetWidth) ?? allowed[allowed.length - 1] ?? 480;
  }
  return photoVariantPath(imageKey, width);
}

export function photoDimensions(imageKey: string): DimensionEntry | undefined {
  return dims[imageKey];
}

/** Responsive sizes hint for a grid tile spanning `w` of 12 columns. */
export function tileSizes(w: number): string {
  return `(min-width: 768px) ${Math.round((w / 12) * 100)}vw, 100vw`;
}