import type { APIRoute } from "astro";
import { getStore } from "~/utils/blob-store";
import type { GalleryTile } from '~/types/gallery';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('upload request');
    // Get admin secret from cookie
    const cookies = request.headers.get('cookie')?.split(';') || [];
    console.log('cookies:', cookies);
    const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
    const adminSecret = adminSecretCookie ? adminSecretCookie.split('=')[1] : null;
    console.log('adminSecret:', "*".repeat(adminSecret?.length || 0));
    

    if (!adminSecret || adminSecret !== import.meta.env.ADMIN_SECRET) {
      console.log('Unauthorized');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.log('Authorized');
    // Get file and gallery slug from form data
    const formData = await request.formData();
    console.log('formData:', formData);
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string;
    const tileW = Number(formData.get('tileW')) || 1;
    const tileH = Number(formData.get('tileH')) || 1;
    console.log('file:', file);
    console.log('slug:', slug);
    console.log("Received form data:", {
      file: file?.name,
      slug,
      formDataKeys: Array.from(formData.keys())
    });

    if (!file || !slug) {
      return new Response(JSON.stringify({ error: 'File and gallery slug are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate slug format
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(slug)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize blob store
    const uploadsStore = getStore('file-uploads');
    const key = `${slug}/${file.name}`;

    // Store the original file
    await uploadsStore.set(key, file, {
      metadata: {
        slug,
        name: file.name,
        type: file.type,
        size: file.size
      }
    });

    // Calculate thumbnail dimensions based on tile size
    const thumbW = Math.round(tileW * 300);
    const thumbH = Math.round(tileH * 300);

    // Create and store thumbnail
    const site = import.meta.env.PUBLIC_URL;
    const originalSrc = encodeURIComponent(`${site}/api/get-raw-image?key=${key}`);
    const thumbUrl = `${site}/.netlify/images?w=${thumbW}&h=${thumbH}&fit=contain&url=${originalSrc}`;
    const thumbResponse = await fetch(thumbUrl);
    if (!thumbResponse.ok) {
      throw new Error('Failed to generate thumbnail');
    }
    const thumbBlob = await thumbResponse.blob();
    const thumbKey = `${slug}/thumb/${file.name}`;
    await uploadsStore.set(thumbKey, thumbBlob, {
      metadata: {
        slug,
        name: file.name,
        type: 'image/jpeg',
        size: thumbBlob.size,
        isThumbnail: true,
        tileW,
        tileH
      }
    });

    // Get the URL for the uploaded file
    // const url = await store.get(key, { type: 'blob' });
    // console.log("File URL:", url);

    return new Response(JSON.stringify({ 
      success: true,
      key,
      thumbKey,
      thumbW,
      thumbH
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to upload file' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
