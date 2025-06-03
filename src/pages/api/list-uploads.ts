import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';

export const prerender = false;
export const GET: APIRoute = async ({ request }) => {
  try {
    // Get admin secret from cookies
    const cookies = request.headers.get('cookie')?.split(';') || [];
    const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
    const adminSecret = adminSecretCookie ? adminSecretCookie.split('=')[1] : null;
    
    console.log("Admin secret from cookie:", adminSecret, import.meta.env.ADMIN_SECRET);
    if (!adminSecret || adminSecret !== import.meta.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get gallery slug from query params
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Gallery slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Netlify Blobs client
    const store = getStore({
      name: 'file-uploads',
      siteID: import.meta.env.NETLIFY_SITE_ID,
      token: import.meta.env.NETLIFY_BLOBS_TOKEN,
    });

    // List all blobs in the gallery's folder
    const { blobs: files } = await store.list({
      prefix: `${slug}/`,
    });
    console.log("Files:", files);

    // Return the list of files
    return new Response(JSON.stringify({ files }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error listing uploads:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to list uploads' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 