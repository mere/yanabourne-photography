import type { APIRoute } from "astro";

export const prerender = false;

// POST /api/auth
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { secret } = data;

    if (!secret) {
      return new Response(JSON.stringify({ error: 'Secret is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if the secret matches the admin secret
    if (secret === import.meta.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid secret' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 