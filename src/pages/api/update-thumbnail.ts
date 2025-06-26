import type { APIRoute } from 'astro';
import { getStore } from '~/utils/blob-store';
import type { GalleryTile } from '~/types/gallery';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get admin secret from cookies
    const cookies = request.headers.get('cookie')?.split(';') || [];
    const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
    const adminSecret = adminSecretCookie ? adminSecretCookie.split('=')[1] : null;
    
    if (!adminSecret || adminSecret !== import.meta.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get image key and tile dimensions from request body
    const { key, tileW, tileH } = await request.json();
    console.log('Update thumbnail request:', { key, tileW, tileH });

    if (!key) {
      return new Response(JSON.stringify({ error: 'Image key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize blob stores
    const uploadsStore = getStore('file-uploads');
    const galleriesStore = getStore('galleries');
    const [slug, ...nameParts] = key.split('/');
    const name = nameParts.join('/');
    const thumbKey = `${slug}/thumb/${name}`;

    console.log('Processing thumbnail:', { key, slug, name, thumbKey });

    // Get the original image
    const originalImage = await uploadsStore.get(key, { type: 'blob' });
    if (!originalImage) {
      return new Response(JSON.stringify({ error: 'Original image not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get gallery data to find the tile
    const gallery = await galleriesStore.get(`gallery/${slug}`, { type: 'json' });
    if (!gallery) {
      return new Response(JSON.stringify({ error: 'Gallery not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find the tile that uses this image
    const tile = gallery.layout.find((t: GalleryTile) => t.imageUrl === key);
    if (!tile) {
      return new Response(JSON.stringify({ error: 'Image not found in gallery layout' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Found tile:', tile);

    // Calculate thumbnail dimensions based on tile size
    const thumbW = Math.round(tile.w * 300);
    const thumbH = Math.round(tile.h * 300);

    // Create a thumbnail using Netlify's image transformation
    const site = import.meta.env.PUBLIC_URL;
    const originalSrc = encodeURIComponent(`${site}/api/get-raw-image?key=${key}`);
    const thumbUrl = `${site}/.netlify/images?w=${thumbW}&h=${thumbH}&fit=contain&url=${originalSrc}`;

    // Fetch the transformed image
    const thumbResponse = await fetch(thumbUrl);
    if (!thumbResponse.ok) {
      throw new Error('Failed to generate thumbnail');
    }

    // Get the thumbnail blob
    const thumbBlob = await thumbResponse.blob();

    // Store the thumbnail
    const metadata = {
      slug,
      name,
      type: 'image/jpeg',
      size: thumbBlob.size,
      isThumbnail: true,
      tileW: tile.w,
      tileH: tile.h
    };

    console.log('Storing thumbnail with metadata:', metadata);

    await uploadsStore.set(thumbKey, thumbBlob, { metadata });

    // Verify the metadata was stored correctly
    const storedMetadata = await uploadsStore.getMetadata(thumbKey);
    console.log('Stored metadata:', storedMetadata);

    return new Response(JSON.stringify({ 
      success: true,
      thumbKey,
      thumbW,
      thumbH
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating thumbnail:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to update thumbnail' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 