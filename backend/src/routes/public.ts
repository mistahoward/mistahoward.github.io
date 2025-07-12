import { Router } from 'itty-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import {
	projects, blogPosts, skills, experience,
} from '../schema';
import { errorResponse, successResponse } from '../middleware/auth';

interface Env {
	DB: D1Database;
}

const router = Router();

// GET /projects route
router.get('/api/projects', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
		return successResponse(allProjects, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch projects', env, 500);
	}
});

// GET /blog - Get all published blog posts
router.get('/api/blog', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const posts = await db.select().from(blogPosts)
			.where(eq(blogPosts.published, true))
			.orderBy(desc(blogPosts.publishedAt));
		return successResponse(posts, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch blog posts', env, 500);
	}
});

// GET /blog/:slug - Get specific blog post
router.get('/api/blog/:slug', async (request: Request, env: Env, ctx: any) => {
	try {
		const slug = ctx.params?.slug;
		if (!slug) {
			return errorResponse('Slug is required', env, 400);
		}

		const db = drizzle(env.DB);
		const post = await db.select().from(blogPosts)
			.where(eq(blogPosts.slug, slug))
			.limit(1);

		if (!post.length) {
			return errorResponse('Post not found', env, 404);
		}

		return successResponse(post[0], env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch blog post', env, 500);
	}
});

// GET /skills - Get all skills
router.get('/api/skills', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const allSkills = await db.select().from(skills).orderBy(skills.category, skills.proficiency);
		return successResponse(allSkills, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch skills', env, 500);
	}
});

// GET /experience - Get work experience
router.get('/api/experience', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const allExperience = await db.select().from(experience)
			.orderBy(desc(experience.startDate));
		return successResponse(allExperience, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch experience', env, 500);
	}
});

// Health check route
router.get('/api/health', (request: Request, env: Env) => successResponse({
	status: 'ok',
	timestamp: new Date().toISOString(),
}, env, 200));

// Catch-all route to log any requests that reach the public router
router.all('*', (request: Request, env: Env) => {
	const url = new URL(request.url);
	console.log(`[PUBLIC] Catch-all: ${request.method} ${url.pathname}`);
	return errorResponse('Not Found', env, 404);
});

export default router;
