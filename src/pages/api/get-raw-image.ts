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
    const blob = await store.get(key);
    
    if (!blob) {
      return new Response(JSON.stringify({ error: 'Image not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return the image data with appropriate content type
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
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