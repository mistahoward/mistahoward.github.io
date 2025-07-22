import { Router } from 'itty-router';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import commentsRoutes from './routes/comments';
import { getCorsHeaders } from './middleware/auth';

// Define environment interface
interface Env {
	DB: D1Database;
	ADMIN_SECRET?: string;
	CORS_ORIGIN?: string;
	PRERENDER_SERVER?: string; // Added for Prerender server URL
}

// Create main router
const router = Router();

// Mount admin routes FIRST
router.all('/api/admin/*', async (request: Request, env: Env, ctx: ExecutionContext) => {
	console.log('[MAIN] Routing to admin router');
	return adminRoutes.handle(request, env, ctx);
});

// Mount comments routes
router.all('/api/comments/*', async (request: Request, env: Env, ctx: ExecutionContext) => {
	console.log('[MAIN] Routing to comments router');
	return commentsRoutes.handle(request, env, ctx);
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
router.get('/api/debug/env', (request: Request, env: Env) => new Response(JSON.stringify({
	hasAdminSecret: !!env.ADMIN_SECRET,
	adminSecretLength: env.ADMIN_SECRET?.length || 0,
	corsOrigin: env.CORS_ORIGIN,
}), {
	status: 200,
	headers: getCorsHeaders(env),
}));

// Catch-all route for 404 errors
router.all('*', (request: Request, env: Env) => new Response(JSON.stringify({ error: 'Not Found' }), {
	status: 404,
	headers: getCorsHeaders(env),
}));

// Bot detection utility
const BOT_USER_AGENTS = [
	/googlebot/i, /bingbot/i, /yandex/i, /baiduspider/i, /facebookexternalhit/i,
	/twitterbot/i, /rogerbot/i, /linkedinbot/i, /embedly/i, /quora link preview/i,
	/showyoubot/i, /outbrain/i, /pinterest/i, /slackbot/i, /vkShare/i, /W3C_Validator/i,
	/redditbot/i, /applebot/i, /WhatsApp/i, /flipboard/i, /tumblr/i, /bitlybot/i,
	/SkypeUriPreview/i, /nuzzel/i, /Discordbot/i, /Google Page Speed/i, /Qwantify/i, /pinterestbot/i,
];
function isBot(userAgent: string) {
	return BOT_USER_AGENTS.some((re) => re.test(userAgent));
}

// Main fetch handler
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const userAgent = request.headers.get('user-agent') || '';
		console.log(`[MAIN] ${request.method} ${url.pathname}`);

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			console.log(`[MAIN] Handling OPTIONS for ${url.pathname}`);
			return new Response(null, {
				headers: getCorsHeaders(env),
			});
		}

		// 1. API routes: handle as usual
		if (url.pathname.startsWith('/api/')) {
			return router.handle(request, env, ctx);
		}

		// 2. Asset requests: serve as usual (skip prerender for .js, .css, images, etc.)
		if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|txt|woff|woff2|ttf|eot)$/)) {
			return fetch(request);
		}

		// 3. Bot/crawler detection for HTML routes
		if (
			isBot(userAgent)
			&& request.method === 'GET'
		) {
			const prerenderUrl = `${env.PRERENDER_SERVER}/${url.origin}${url.pathname}${url.search}`;
			console.log(`[MAIN] Proxying to Prerender: ${prerenderUrl}`);
			const prerenderResp = await fetch(prerenderUrl, {
				headers: { 'User-Agent': userAgent },
			});
			return new Response(await prerenderResp.text(), {
				status: prerenderResp.status,
				headers: { 'content-type': 'text/html' },
			});
		}

		// 4. Fallback: serve SPA (index.html) or static asset
		return fetch(request);
	},
};
