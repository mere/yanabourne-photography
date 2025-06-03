import type { APIRoute } from "astro";
import { getStore } from "@netlify/blobs";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get admin secret from cookie
    const cookies = request.headers.get('cookie')?.split(';') || [];
    const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
    const adminSecret = adminSecretCookie ? adminSecretCookie.split('=')[1] : null;
    
    console.log("Admin secret from cookie:", adminSecret);

    if (!adminSecret || adminSecret !== import.meta.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get file and gallery slug from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string;

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

    // Initialize Netlify Blobs client
    const store = getStore({
      name: 'file-uploads',
      siteID: import.meta.env.NETLIFY_SITE_ID,
      token: import.meta.env.NETLIFY_BLOBS_TOKEN,
    });

    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${randomString}-${file.name}`;
    const key = `${slug}/${filename}`;

    console.log("Storing file with key:", key);
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Store the file
    await store.set(key, file);

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
