import { Router } from 'itty-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import {
	projects, blogPosts, skills, experience,
} from '../schema';
import { getCorsHeaders, errorResponse, successResponse } from '../middleware/auth';

interface Env {
  DB: D1Database;
}

const router = Router();

// GET /projects route
router.get('/api/projects', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
		return successResponse(allProjects, 200, env);
	} catch (error) {
		return errorResponse('Failed to fetch projects', 500, env);
	}
});

// GET /blog - Get all published blog posts
router.get('/api/blog', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const posts = await db.select().from(blogPosts)
			.where(eq(blogPosts.published, true))
			.orderBy(desc(blogPosts.publishedAt));
		return successResponse(posts, 200, env);
	} catch (error) {
		return errorResponse('Failed to fetch blog posts', 500, env);
	}
});

// GET /blog/:slug - Get specific blog post
router.get('/api/blog/:slug', async (request: Request, env: Env, ctx: any) => {
	try {
		const slug = ctx.params?.slug;
		if (!slug) {
			return errorResponse('Slug is required', 400, env);
		}

		const db = drizzle(env.DB);
		const post = await db.select().from(blogPosts)
			.where(eq(blogPosts.slug, slug))
			.limit(1);

		if (!post.length) {
			return errorResponse('Post not found', 404, env);
		}

		return successResponse(post[0], 200, env);
	} catch (error) {
		return errorResponse('Failed to fetch blog post', 500, env);
	}
});

// GET /skills - Get all skills
router.get('/api/skills', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const allSkills = await db.select().from(skills).orderBy(skills.category, skills.proficiency);
		return successResponse(allSkills, 200, env);
	} catch (error) {
		return errorResponse('Failed to fetch skills', 500, env);
	}
});

// GET /experience - Get work experience
router.get('/api/experience', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const allExperience = await db.select().from(experience)
			.orderBy(desc(experience.startDate));
		return successResponse(allExperience, 200, env);
	} catch (error) {
		return errorResponse('Failed to fetch experience', 500, env);
	}
});

// Health check route
router.get('/api/health', (request: Request, env: Env) => successResponse({
	status: 'ok',
	timestamp: new Date().toISOString(),
}, 200, env));

// Catch-all route to log any requests that reach the public router
router.all('*', (request: Request, env: Env) => {
	const url = new URL(request.url);
	console.log(`[PUBLIC] Catch-all: ${request.method} ${url.pathname}`);
	return errorResponse('Not Found', 404, env);
});

export default router;
