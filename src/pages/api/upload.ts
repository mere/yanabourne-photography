import type { APIRoute } from "astro";
import { getStore } from "~/utils/blob-store";

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
    const store = getStore('file-uploads');

    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    
    // Sanitize the original filename
    const sanitizedOriginalName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-') // Replace invalid chars with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
    
    const filename = `${timestamp}-${randomString}-${sanitizedOriginalName}`;
    const key = `${slug}/${filename}`;

    console.log("Key generation details:", {
      slug,
      originalFilename: file.name,
      sanitizedOriginalName,
      filename,
      key,
      keyLength: key.length,
      keyContainsSpaces: key.includes(' '),
      keyContainsSpecialChars: /[^a-z0-9\-\.\/]/.test(key),
      keyStartsWithSlash: key.startsWith('/'),
      keyEndsWithSlash: key.endsWith('/'),
      keyHasMultipleSlashes: /\/{2,}/.test(key)
    });

    console.log("Storing file with key:", key);
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Store the file
    await store.set(key, file, {
      metadata: {
        slug,
        name: file.name,
        type: file.type,
        size: file.size
      }
    });

    // Get the URL for the uploaded file
    // const url = await store.get(key, { type: 'blob' });
    // console.log("File URL:", url);

    return new Response(JSON.stringify({ url:key }), {
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
