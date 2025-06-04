import type { APIRoute } from 'astro';
import { getStore } from '~/utils/blob-store';
import type { Gallery, GalleryTile } from '~/types/gallery';

export const prerender = false;

export const DELETE: APIRoute = async ({ request }) => {
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

    // Get all galleries to check for used images
    const galleriesStore = getStore('galleries');
    const { blobs: galleryBlobs } = await galleriesStore.list({
      prefix: 'gallery/',
    });

    // Parse gallery data to get used images
    const galleries = await Promise.all(
      galleryBlobs.map(async (blob: { key: string }) => {
        const data = await galleriesStore.get(blob.key, { type: 'json' }) as Gallery;
        return data;
      })
    );

    // Create a set of all used image URLs
    const usedImageUrls = new Set<string>();
    galleries.forEach((gallery: Gallery) => {
      gallery.layout.forEach((tile: GalleryTile) => {
        if (tile.imageUrl) {
          usedImageUrls.add(tile.imageUrl);
        }
      });
    });

    // Get all uploaded images
    const uploadsStore = getStore('file-uploads');
    const { blobs: uploadBlobs } = await uploadsStore.list();

    // Delete unused uploads
    let deletedCount = 0;
    for (const blob of uploadBlobs) {
      if (!usedImageUrls.has(blob.key)) {
        await uploadsStore.delete(blob.key);
        deletedCount++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      deletedCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting unused uploads:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to delete unused uploads' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 