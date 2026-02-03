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
			headers: getCorsHeaders(env, request),
		});
	}

	const token = authHeader.substring(7);
	if (token !== env.ADMIN_SECRET) {
		return new Response(JSON.stringify({ error: 'Invalid token' }), {
			status: 403,
			headers: getCorsHeaders(env, request),
		});
	}

	return null; // Continue to next handler
};

// Firebase authentication middleware for comments
export const requireAuth = async (request: Request) => {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return new Response(JSON.stringify({ error: 'Unauthorized - No token provided' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const token = authHeader.substring(7);

	try {
		const { verifyIdToken } = await import('../utils/firebase-admin');
		const decodedToken = await verifyIdToken(token);

		// Add user info to request for downstream handlers
		(request as any).user = {
			uid: decodedToken.uid,
			email: decodedToken.email,
			displayName: decodedToken.name,
			photoURL: decodedToken.picture,
		};

		return null; // Continue to next handler
	} catch (error) {
		console.error('Authentication error:', error);
		return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// CORS headers helper
export const getCorsHeaders = (env: Env, request?: Request) => {
	const origin = request?.headers.get('Origin');
	const allowedOrigin = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))
		? origin
		: (env.CORS_ORIGIN || 'http://localhost:5173');

	return {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': allowedOrigin,
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
};

// Legacy corsHeaders for backward compatibility (deprecated)
export const corsHeaders = {
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Error response helper
export const errorResponse = (message: string, env?: Env, status: number = 500, request?: Request) => {
	const headers = env ? getCorsHeaders(env, request) : corsHeaders;
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers,
	});
};

// Success response helper
export const successResponse = (data: any, env?: Env, status: number = 200, request?: Request) => {
	const headers = env ? getCorsHeaders(env, request) : corsHeaders;
	return new Response(JSON.stringify(data), {
		status,
		headers,
	});
};
