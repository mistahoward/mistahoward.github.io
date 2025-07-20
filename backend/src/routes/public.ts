import { Router } from 'itty-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import {
	projects, blogPosts, skills, experience, testimonials, certifications, pets, testimonialInvites, tags, blogPostTags,
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

		// Get tags for each post
		const postsWithTags = await Promise.all(
			posts.map(async (post) => {
				const postTags = await db
					.select({ name: tags.name })
					.from(blogPostTags)
					.innerJoin(tags, eq(blogPostTags.tagId, tags.id))
					.where(eq(blogPostTags.blogPostId, post.id));

				return {
					...post,
					tags: postTags.map((t) => t.name),
				};
			}),
		);

		return successResponse(postsWithTags, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch blog posts', env, 500);
	}
});

// GET /blog/:slug - Get specific blog post
router.get('/api/blog/:slug', async (request: Request, env: Env, ctx: any) => {
	try {
		let slug = ctx && ctx.params ? ctx.params.slug : undefined;
		if (!slug) {
			const url = new URL(request.url);
			slug = url.pathname.split('/').pop();
			console.log('[DEBUG] manual slug:', slug);
		}
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

		// Get tags for the post
		const postTags = await db
			.select({ name: tags.name })
			.from(blogPostTags)
			.innerJoin(tags, eq(blogPostTags.tagId, tags.id))
			.where(eq(blogPostTags.blogPostId, post[0].id));

		const postWithTags = {
			...post[0],
			tags: postTags.map((t) => t.name),
		};

		return successResponse(postWithTags, env, 200);
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

// GET /testimonials - Get all approved testimonials
router.get('/api/testimonials', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const allTestimonials = await db.select().from(testimonials)
			.where(eq(testimonials.status, 'approved'))
			.orderBy(desc(testimonials.createdAt));
		return successResponse(allTestimonials, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch testimonials', env, 500);
	}
});

// POST /api/testimonials - Public testimonial submission
router.post('/api/testimonials', async (request: Request, env: Env) => {
	try {
		const body = (await request.json()) as {
			clientName: string;
			clientTitle?: string;
			clientCompany?: string;
			content: string;
			rating?: number;
			relationship: string;
			token: string;
		};

		const {
			clientName,
			clientTitle,
			clientCompany,
			content,
			rating,
			relationship,
			token,
		} = body;

		if (!clientName || !content || !relationship || !token) return errorResponse('Missing required fields', env, 400);

		const db = drizzle(env.DB);
		const inviteRows = await db.select().from(testimonialInvites).where(eq(testimonialInvites.token, token));
		const invite = inviteRows[0];
		if (!invite) return errorResponse('Invalid or expired invite token', env, 403);
		if (invite.used) return errorResponse('This invite link has already been used', env, 403);
		if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return errorResponse('This invite link has expired', env, 403);

		await db.insert(testimonials).values({
			clientName,
			clientTitle,
			clientCompany,
			content,
			rating,
			relationship,
			status: 'needs_review',
		});
		await db.update(testimonialInvites).set({ used: true, usedAt: new Date().toISOString() }).where(eq(testimonialInvites.id, invite.id));

		return successResponse({ message: 'Testimonial submitted for review.' }, env, 201);
	} catch (error) {
		return errorResponse('Failed to submit testimonial', env, 500);
	}
});

// GET /certifications - Get all certifications
router.get('/api/certifications', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const allCertifications = await db.select().from(certifications)
			.orderBy(desc(certifications.issueDate));
		return successResponse(allCertifications, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch certifications', env, 500);
	}
});

// GET /pets - Get all active pets
router.get('/api/pets', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const allPets = await db.select().from(pets)
			.where(eq(pets.isActive, true))
			.orderBy(desc(pets.createdAt));
		return successResponse(allPets, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch pets', env, 500);
	}
});

// GET /tags - Get all tags for public use
router.get('/api/tags', async (request: Request, env: Env) => {
	try {
		const db = drizzle(env.DB);
		const allTags = await db.select().from(tags).orderBy(tags.name);
		return successResponse(allTags, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch tags', env, 500);
	}
});

// Public endpoint to validate testimonial invite token
router.get('/api/testimonials/validate-token', async (request: Request, env: Env) => {
	try {
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		if (!token) return errorResponse('Token is required', env, 400);
		const db = drizzle(env.DB);
		const inviteRows = await db.select().from(testimonialInvites).where(eq(testimonialInvites.token, token));
		const invite = inviteRows[0];
		if (!invite) return successResponse({ valid: false, reason: 'Invalid or expired invite token.' }, env, 200);
		if (invite.used) return successResponse({ valid: false, reason: 'This invite link has already been used.' }, env, 200);
		if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return successResponse({ valid: false, reason: 'This invite link has expired.' }, env, 200);
		return successResponse({ valid: true }, env, 200);
	} catch (error) {
		return errorResponse('Failed to validate invite token', env, 500);
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
