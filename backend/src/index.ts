import { Router } from 'itty-router';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import { getCorsHeaders } from './middleware/auth';

// Define environment interface
interface Env {
  DB: D1Database;
  ADMIN_SECRET?: string;
  CORS_ORIGIN?: string;
}

// Create main router
const router = Router();

// Mount admin routes FIRST
router.all('/api/admin/*', async (request: Request, env: Env, ctx: ExecutionContext) => {
  console.log('[MAIN] Routing to admin router');
  return adminRoutes.handle(request, env, ctx);
});

// Mount public routes
router.all('/api/*', async (request: Request, env: Env, ctx: ExecutionContext) => {
  console.log('[MAIN] Routing to public router');
  return publicRoutes.handle(request, env, ctx);
});

// Debug: Log the router setup
console.log('[MAIN] Router setup complete');
console.log('[MAIN] Admin routes mounted at /api/admin/*');
console.log('[MAIN] Public routes mounted at /api/*');

// Debug endpoint to check environment variables (remove in production)
router.get('/api/debug/env', (request: Request, env: Env) => {
  return new Response(JSON.stringify({
    hasAdminSecret: !!env.ADMIN_SECRET,
    adminSecretLength: env.ADMIN_SECRET?.length || 0,
    corsOrigin: env.CORS_ORIGIN,
  }), {
    status: 200,
    headers: getCorsHeaders(env),
  });
});

// Catch-all route for 404 errors
router.all('*', (request: Request, env: Env) => new Response(JSON.stringify({ error: 'Not Found' }), {
  status: 404,
  headers: getCorsHeaders(env),
}));

// Main fetch handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    console.log(`[MAIN] ${request.method} ${url.pathname}`);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      console.log(`[MAIN] Handling OPTIONS for ${url.pathname}`);
      return new Response(null, {
        headers: getCorsHeaders(env),
      });
    }

    try {
      const response = await router.handle(request, env, ctx);
      console.log(`[MAIN] ${request.method} ${url.pathname} -> ${response.status}`);
      return response;
    } catch (error) {
      console.error(`[MAIN] Error handling request for ${url.pathname}:`, error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: getCorsHeaders(env),
      });
    }
  },
};
