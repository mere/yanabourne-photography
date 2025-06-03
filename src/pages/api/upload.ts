import type { APIRoute } from "astro";
import { getStore } from "@netlify/blobs";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const secret = formData.get("secret") as string;
    const folder = formData.get("folder") as string;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }
    const key = `${folder}/${file.name}`;

    const uploads = getStore("file-uploads");
    
    await uploads.set(key, file, {
      metadata: {},
    });

    return new Response(JSON.stringify({ status: "success", key }), {
      status: 200,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Upload failed",
      }),
      { status: 500 }
    );
  }
};
