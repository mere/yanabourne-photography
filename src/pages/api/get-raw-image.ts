import type { APIRoute } from 'astro';
import { getStore } from '~/utils/blob-store';

export const prerender = false;
export const GET: APIRoute = async ({ request }) => {
  try {
    // Get gallery slug and filename from query params
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    if (!key) {
      return new Response(JSON.stringify({ error: 'Key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize blob store
    const store = getStore('file-uploads');

    // Get the blob
    const blob = await store.getWithMetadata(key, {
        type: "stream",
      });

    
    
    if (!blob) {
      return new Response(JSON.stringify({ error: 'Image not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(blob.metadata);
    // Return the image data with appropriate content type
    return new Response(blob.data, {
      status: 200,
      headers: {
        'Content-Type': String(blob.metadata.type),
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    console.error('Error getting raw image:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to get raw image' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 