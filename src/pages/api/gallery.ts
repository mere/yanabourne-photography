import type { APIRoute } from "astro";
import { getStore } from "@netlify/blobs";

export const prerender = false;

// Helper function to get gallery data
async function getGalleryData(slug: string) {
  const store = getStore({
    name: 'galleries',
    siteID: import.meta.env.NETLIFY_SITE_ID,
    token: import.meta.env.NETLIFY_BLOBS_TOKEN,
  });

  const key = `gallery/${slug}`;
  const data = await store.get(key, { type: 'json' });
  return data;
}

// Helper function to save gallery data
async function saveGalleryData(slug: string, data: any) {
  const store = getStore({
    name: 'galleries',
    siteID: import.meta.env.NETLIFY_SITE_ID,
    token: import.meta.env.NETLIFY_BLOBS_TOKEN,
  });

  const key = `gallery/${slug}`;
  await store.set(key, JSON.stringify(data));
}

// GET /api/gallery?slug=xxx
export const GET: APIRoute = async ({ request }) => {
  try {
    // Get admin secret from cookie
    const cookies = request.headers.get('cookie')?.split(';') || [];
    const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
    const adminSecret = adminSecretCookie ? adminSecretCookie.split('=')[1] : null;
    
    if (!adminSecret || adminSecret !== import.meta.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Gallery slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await getGalleryData(slug);
    if (!data) {
      return new Response(JSON.stringify({ error: 'Gallery not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting gallery:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to get gallery' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST /api/gallery
export const POST: APIRoute = async ({ request }) => {
  try {
    // Get admin secret from cookie
    const cookies = request.headers.get('cookie')?.split(';') || [];
    const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
    const adminSecret = adminSecretCookie ? adminSecretCookie.split('=')[1] : null;
    
    if (!adminSecret || adminSecret !== import.meta.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    const { slug, title, layout } = data;

    if (!slug || !title || !layout) {
      return new Response(JSON.stringify({ error: 'Gallery slug, title, and layout are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if gallery exists
    const existingData = await getGalleryData(slug);
    if (existingData) {
      return new Response(JSON.stringify({ error: 'Gallery already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new gallery
    const newGallery = {
      title,
      slug,
      layout,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveGalleryData(slug, newGallery);

    return new Response(JSON.stringify(newGallery), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating gallery:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to create gallery' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/gallery
export const PUT: APIRoute = async ({ request }) => {
  try {
    // Get admin secret from cookie
    const cookies = request.headers.get('cookie')?.split(';') || [];
    const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
    const adminSecret = adminSecretCookie ? adminSecretCookie.split('=')[1] : null;
    
    if (!adminSecret || adminSecret !== import.meta.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    const { slug, layout } = data;

    if (!slug || !layout) {
      return new Response(JSON.stringify({ error: 'Gallery slug and layout are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get existing gallery
    const existingData = await getGalleryData(slug);
    if (!existingData) {
      return new Response(JSON.stringify({ error: 'Gallery not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update gallery
    const updatedGallery = {
      ...existingData,
      layout,
      updatedAt: Date.now()
    };

    await saveGalleryData(slug, updatedGallery);

    return new Response(JSON.stringify(updatedGallery), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating gallery:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to update gallery' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE /api/gallery?slug=xxx
export const DELETE: APIRoute = async ({ request }) => {
  try {
    // Get admin secret from cookie
    const cookies = request.headers.get('cookie')?.split(';') || [];
    const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
    const adminSecret = adminSecretCookie ? adminSecretCookie.split('=')[1] : null;
    
    if (!adminSecret || adminSecret !== import.meta.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Gallery slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const store = getStore({
      name: 'galleries',
      siteID: import.meta.env.NETLIFY_SITE_ID,
      token: import.meta.env.NETLIFY_BLOBS_TOKEN,
    });

    const key = `gallery-${slug}`;
    await store.delete(key);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to delete gallery' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 