

import { getStore as getStoreFromNetlify } from "@netlify/blobs";

const NETLIFY_SITE_ID = Netlify.env.get("NETLIFY_SITE_ID");
const NETLIFY_BLOBS_TOKEN = Netlify.env.get("NETLIFY_BLOBS_TOKEN");
const ADMIN_SECRET = Netlify.env.get("ADMIN_SECRET");


export const getStore = (key: string) => {
  if (NETLIFY_SITE_ID && NETLIFY_BLOBS_TOKEN) {
  return getStoreFromNetlify({
    name: key,
    siteID: NETLIFY_SITE_ID,
    token: NETLIFY_BLOBS_TOKEN,
  });
} else {
    return getStoreFromNetlify(key);
}
};

export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response('File upload API only accepts POST requests', { status: 200 });
  }

  try {
    console.log('upload request');
    // Get admin secret from cookie
    const cookies = request.headers.get('cookie')?.split(';') || [];
    console.log('cookies:', cookies);
    const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
    const adminSecret = adminSecretCookie ? adminSecretCookie.split('=')[1] : null;
    console.log('adminSecret:', "*".repeat(adminSecret?.length || 0));
    

    if (!adminSecret || adminSecret !== ADMIN_SECRET) {
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
    console.log('timestamp:', timestamp);
    const randomString = Math.random().toString(36).substring(2, 15);
    console.log('randomString:', randomString);
    
    // Sanitize the original filename
    const sanitizedOriginalName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-') // Replace invalid chars with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
    console.log('sanitizedOriginalName:', sanitizedOriginalName);
    const filename = `${timestamp}-${randomString}-${sanitizedOriginalName}`;
    console.log('filename:', filename);
    const key = `${slug}/${filename}`;
    console.log('key:', key);
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

    return new Response(JSON.stringify({ url:key, edge: true }), {
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
