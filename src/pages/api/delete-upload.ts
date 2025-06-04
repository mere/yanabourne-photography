import type { APIRoute } from 'astro';
import { getStore } from '~/utils/blob-store';

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

    // Get image key from query params
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    if (!key) {
      return new Response(JSON.stringify({ error: 'Image key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize blob store
    const store = getStore('file-uploads');

    // Delete the blob
    await store.delete(key);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting upload:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to delete upload' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 