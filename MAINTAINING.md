# Maintaining Yana Bourne Photography (static)

The site is a **static Astro build** deployed to `/srv/yanabourne/photography/` on the Hetzner box. Gallery copy and layout live in git as JSON. Original photos stay on the server under `/srv/yanabourne/photos/originals/` and are **not** in the repository.

## Repository layout

| Path | Purpose |
|------|---------|
| `src/content/galleries/{slug}.json` | Gallery title, 12-column grid layout, captions, links |
| `src/data/photo-dimensions.json` | Intrinsic width/height per image key (committed) |
| `scripts/build-variants.mjs` | Server-side sharp pipeline for `/photos` variants |
| `deploy/Caddyfile` | Caddy vhosts for yanabourne.com + photography |
| `deploy/deploy.sh` | Build locally and rsync `dist/` to the server |

### Image keys

Each photo tile uses `imageUrl` like:

`black-and-white/1749034851450-8kez1seb1nv-DSC_0147.JPG`

That must match a file at:

`/srv/yanabourne/photos/originals/black-and-white/1749034851450-8kez1seb1nv-DSC_0147.JPG`

Public URLs are:

`/photos/{slug}/{stem}-w{480|960|1600|2400}.webp`

where `{stem}` is the filename without extension.

## Add a photo to a gallery

1. Upload the original to the server:  
   `/srv/yanabourne/photos/originals/{slug}/new-file.jpg`
2. Edit `src/content/galleries/{slug}.json`: add a tile object with `id`, `imageUrl`, grid `x`/`y`/`w`/`h`, `altText`, optional `description` / `link`.
3. On the server (in a clone of this repo):  
   `npm ci && npm run build-variants`  
   This creates web variants and updates `src/data/photo-dimensions.json`.
4. Commit the JSON changes and the updated manifest.
5. Deploy (see below).

## Remove a photo

1. Remove the tile from the gallery JSON.
2. Delete the original on the server if it is no longer needed.
3. Optionally remove orphaned files under `/srv/yanabourne/photos/web/{slug}/`.
4. Re-run `build-variants` if you removed originals (manifest will drop updated keys on next full scan).
5. Commit and deploy.

## Reorder or resize tiles

Edit the tile’s `x`, `y`, `w`, `h` in the gallery JSON (12-column grid). Commit and deploy. No variant rebuild required.

## Add or rename a gallery

1. Add `src/content/galleries/{slug}.json` (copy structure from an existing gallery).
2. Add a home-page tile in `src/content/galleries/home.json` with `link: "/gallery/{slug}"` and the label in `description`.
3. Ensure `src/lib/galleries.ts` imports the new JSON and registers the slug (and add to `photoGallerySlugs` implicitly via the map).
4. Create `originals/{slug}/` on the server, add photos, run `build-variants`.
5. Deploy.

## Edit text (about, captions, pricing)

- **About** body: `src/content/galleries/about.json` — text-only tile `description` (HTML).
- **Home** captions on tiles: `description` on image tiles in `home.json`.
- **Book me** pricing cards: `src/pages/book-me.astro` (static HTML section).
- **Contact** copy: `src/react/ContactForm.tsx` and `src/pages/contact.astro`.

## Regenerate photo variants and manifest

On the Hetzner host (paths must exist):

```bash
export ORIGINALS_ROOT=/srv/yanabourne/photos/originals
export WEB_ROOT=/srv/yanabourne/photos/web
cd /path/to/yanabourne-photography
npm ci
npm run build-variants
git add src/data/photo-dimensions.json
git commit -m "Update photo dimensions manifest"
```

The script is idempotent: existing variant files are skipped.

## Build and deploy

Local build:

```bash
npm ci
npm run build
npm run preview   # optional smoke test
```

Deploy to production:

```bash
export DEPLOY_SSH_KEY=/path/to/deploy_key   # never commit this key
./deploy/deploy.sh
```

`deploy.sh` runs `npm ci`, `npm run build`, then `rsync -avz --delete dist/` to `deploy@2.29.178.86:/srv/yanabourne/photography/`.

## Caddy on the server

Copy `deploy/Caddyfile` and `deploy/legacy-image-redirects.caddy` to the server’s Caddy config directory (or symlink). Reload Caddy after changes.

- `photography.yanabourne.com` → static site root `/srv/yanabourne/photography`
- `/photos/*` → `/srv/yanabourne/photos/web` with long cache headers
- Old `/api/get-raw-image?key=…` URLs redirect to the largest web variant

Regenerate redirects after bulk URL changes:

```bash
npm run generate-redirects
```

## Contact form

The contact page is static HTML. Netlify Forms is no longer used. Wire `ContactForm` to your preferred handler (e.g. Formspree, a small API on the main site, or `mailto:`) before expecting submissions in production.