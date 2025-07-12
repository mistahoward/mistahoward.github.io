interface Env {
  DB: D1Database;
  ADMIN_SECRET?: string;
  CORS_ORIGIN?: string;
}

// Admin authentication middleware
export const requireAdmin = (request: Request, env: Env) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.substring(7);
  if (token !== env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null; // Continue to next handler
};

// CORS headers helper
export const getCorsHeaders = (env: Env) => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': env.CORS_ORIGIN || 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

// Legacy corsHeaders for backward compatibility (deprecated)
export const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Error response helper
export const errorResponse = (message: string, status: number = 500, env?: Env) => {
  const headers = env ? getCorsHeaders(env) : corsHeaders;
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers,
  });
};

// Success response helper
export const successResponse = (data: any, status: number = 200, env?: Env) => {
  const headers = env ? getCorsHeaders(env) : corsHeaders;
  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}; 