import { createClient } from '@netlify/blobs';

// Initialize the Netlify Blobs client
const blobs = createClient({
  token: import.meta.env.PUBLIC_NETLIFY_BLOBS_TOKEN,
  siteID: import.meta.env.PUBLIC_NETLIFY_SITE_ID,
});

export async function uploadFile(file: File): Promise<string> {
  // Generate a unique key for the file
  const key = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
  
  // Upload the file to Netlify Blobs
  await blobs.put(key, file, {
    contentType: file.type,
  });

  // Return the public URL
  return blobs.url(key);
}

export async function deleteFile(url: string): Promise<void> {
  // Extract the key from the URL
  const key = url.split('/').pop();
  if (!key) {
    throw new Error('Invalid file URL');
  }

  // Delete the file from Netlify Blobs
  await blobs.delete(key);
} 