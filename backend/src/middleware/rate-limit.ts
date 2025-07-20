import { errorResponse } from './auth';

interface RateLimitConfig {
	windowMs: number; // Time window in milliseconds
	maxRequests: number; // Maximum requests per window
	keyGenerator?: (request: Request, env: any) => string; // Function to generate rate limit key
}

interface RateLimitStore {
	[key: string]: {
		count: number;
		resetTime: number;
	};
}

// In-memory store for rate limiting (in production, consider using KV or Durable Objects)
const rateLimitStore: RateLimitStore = {};

// Clean up expired entries periodically
const cleanupExpiredEntries = () => {
	const now = Date.now();
	Object.keys(rateLimitStore).forEach(key => {
		if (rateLimitStore[key].resetTime < now) {
			delete rateLimitStore[key];
		}
	});
};

export const createRateLimit = (config: RateLimitConfig) => {
	return async (request: Request, env: any): Promise<Response | null> => {
		// Clean up expired entries periodically
		cleanupExpiredEntries();

		const key = config.keyGenerator
			? config.keyGenerator(request, env)
			: request.headers.get('cf-connecting-ip') || 'unknown';

		const now = Date.now();

		// Initialize or get existing rate limit data
		if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
			rateLimitStore[key] = {
				count: 0,
				resetTime: now + config.windowMs,
			};
		}

		// Increment request count
		rateLimitStore[key].count++;

		// Check if rate limit exceeded
		if (rateLimitStore[key].count > config.maxRequests) {
			const retryAfter = Math.ceil((rateLimitStore[key].resetTime - now) / 1000);
			return errorResponse(
				`Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
				env,
				429
			);
		}

		// Add rate limit headers to response
		const remaining = Math.max(0, config.maxRequests - rateLimitStore[key].count);
		(request as any).rateLimitHeaders = {
			'X-RateLimit-Limit': config.maxRequests.toString(),
			'X-RateLimit-Remaining': remaining.toString(),
			'X-RateLimit-Reset': rateLimitStore[key].resetTime.toString(),
		};

		return null; // Continue to next middleware/handler
	};
};

// Predefined rate limit configurations
export const rateLimits = {
	// Strict rate limit for comment creation (5 comments per minute)
	commentCreation: createRateLimit({
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 5,
		keyGenerator: (request: Request, env: any) => {
			// Use user ID if available, otherwise use IP
			const authHeader = request.headers.get('Authorization');
			if (authHeader && authHeader.startsWith('Bearer ')) {
				// In a real implementation, you'd decode the JWT to get user ID
				// For now, we'll use a hash of the token
				return `comment_creation_${authHeader.substring(7).slice(0, 10)}`;
			}
			return `comment_creation_ip_${request.headers.get('cf-connecting-ip') || 'unknown'}`;
		},
	}),

	// Moderate rate limit for voting (20 votes per minute)
	voting: createRateLimit({
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 20,
		keyGenerator: (request: Request, env: any) => {
			const authHeader = request.headers.get('Authorization');
			if (authHeader && authHeader.startsWith('Bearer ')) {
				return `voting_${authHeader.substring(7).slice(0, 10)}`;
			}
			return `voting_ip_${request.headers.get('cf-connecting-ip') || 'unknown'}`;
		},
	}),

	// General API rate limit (100 requests per minute)
	general: createRateLimit({
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 100,
		keyGenerator: (request: Request, env: any) => {
			return `general_${request.headers.get('cf-connecting-ip') || 'unknown'}`;
		},
	}),
}; 