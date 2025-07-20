import { Router } from 'itty-router';
import { drizzle } from 'drizzle-orm/d1';
import {
	eq, desc, inArray, and, sum,
} from 'drizzle-orm';
import {
	blogPosts,
	pets,
	testimonials,
	projects,
	skills,
	experience,
	certifications,
	testimonialInvites,
	tags,
	blogPostTags,
	comments,
	users,
	votes,
} from '../schema';
import {
	requireAdmin,
	getCorsHeaders,
	errorResponse,
	successResponse,
} from '../middleware/auth';

interface Env {
	DB: D1Database;
	PET_IMAGES: R2Bucket;
	ADMIN_SECRET?: string;
	R2_DOMAIN?: string;
}

const router = Router();

// Admin authentication endpoint
router.post('/api/admin/auth', async (request: Request, env: Env) => {
	console.log('[ADMIN] POST /api/admin/auth called');
	try {
		const body = await request.json() as { password: string };

		// Simple password check - you should use a more secure method in production
		if (body.password === env.ADMIN_SECRET) {
			return successResponse({
				token: env.ADMIN_SECRET,
				message: 'Authentication successful',
			}, env, 200);
		}
		return errorResponse('Invalid password', env, 401);
	} catch (error) {
		return errorResponse('Authentication failed', env, 500);
	}
});

// Admin token verification endpoint
router.get('/api/admin/verify', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;
	return successResponse({ message: 'Token valid' }, env, 200);
});

// BLOG ADMIN ROUTES

// POST /admin/blog - Create new blog post
router.post('/api/admin/blog', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const body = await request.json() as {
			title: string;
			slug: string;
			content: string;
			excerpt?: string;
			published?: boolean;
			tags?: string[];
		};
		const db = drizzle(env.DB);

		const newPostArr = await db.insert(blogPosts).values({
			title: body.title,
			slug: body.slug,
			content: body.content,
			excerpt: body.excerpt,
			published: body.published || false,
			publishedAt: body.published ? new Date().toISOString() : null,
		}).returning();
		const newPost = newPostArr[0];

		if (body.tags && Array.isArray(body.tags)) {
			const tagIds: number[] = [];
			for (const tagName of body.tags) {
				let tag = (await db.select().from(tags).where(eq(tags.name, tagName)))[0];
				if (!tag) {
					const inserted = await db.insert(tags).values({ name: tagName }).returning();
					tag = inserted[0];
				}
				tagIds.push(tag.id);
			}
			for (const tagId of tagIds) {
				await db.insert(blogPostTags).values({ blogPostId: newPost.id, tagId }).onConflictDoNothing();
			}
		}

		return successResponse(newPost, env, 201);
	} catch (error) {
		return errorResponse('Failed to create blog post', env, 500);
	}
});

// PUT /admin/blog/:id - Update blog post
router.put('/api/admin/blog/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);
		const body = await request.json() as {
			title: string;
			slug: string;
			content: string;
			excerpt?: string;
			published?: boolean;
			tags?: string[];
		};
		const db = drizzle(env.DB);

		const updatedPostArr = await db.update(blogPosts)
			.set({
				title: body.title,
				slug: body.slug,
				content: body.content,
				excerpt: body.excerpt,
				published: body.published,
				publishedAt: body.published ? new Date().toISOString() : null,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(blogPosts.id, id))
			.returning();

		if (!updatedPostArr.length) {
			return errorResponse('Blog post not found', env, 404);
		}
		const updatedPost = updatedPostArr[0];

		if (body.tags && Array.isArray(body.tags)) {
			const tagIds: number[] = [];
			for (const tagName of body.tags) {
				let tag = (await db.select().from(tags).where(eq(tags.name, tagName)))[0];
				if (!tag) {
					const inserted = await db.insert(tags).values({ name: tagName }).returning();
					tag = inserted[0];
				}
				tagIds.push(tag.id);
			}
			// Remove old associations
			await db.delete(blogPostTags).where(eq(blogPostTags.blogPostId, id));
			// Add new associations
			for (const tagId of tagIds) {
				await db.insert(blogPostTags).values({ blogPostId: id, tagId }).onConflictDoNothing();
			}
		}

		return successResponse(updatedPost, env, 200);
	} catch (error) {
		return errorResponse('Failed to update blog post', env, 500);
	}
});

// DELETE /admin/blog/:id - Delete blog post
router.delete('/api/admin/blog/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);

		if (Number.isNaN(id)) {
			console.error('[ADMIN] Invalid blog post ID provided:', ctx.params?.id);
			return errorResponse('Invalid blog post ID', env, 400);
		}

		const db = drizzle(env.DB);

		const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));

		if (result.meta.changes === 0) {
			console.warn(`[ADMIN] No blog post found with ID: ${id}`);
			return errorResponse('Blog post not found', env, 404);
		}

		return successResponse({ message: 'Blog post deleted' }, env, 200);
	} catch (error) {
		console.error('[ADMIN] Blog post delete error:', error);
		return errorResponse('Failed to delete blog post', env, 500);
	}
});

// GET /admin/blog - Get all blog posts (including drafts)
router.get('/api/admin/blog', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const db = drizzle(env.DB);
		const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));

		// Fetch tags for all posts
		const postIds = posts.map((p) => p.id);
		let tagsByPostId: Record<number, string[]> = {};
		if (postIds.length > 0) {
			const tagRows = await db
				.select({ blogPostId: blogPostTags.blogPostId, tagName: tags.name })
				.from(blogPostTags)
				.leftJoin(tags, eq(blogPostTags.tagId, tags.id))
				.where(inArray(blogPostTags.blogPostId, postIds));
			tagsByPostId = tagRows.reduce((acc, row) => {
				if (!acc[row.blogPostId]) acc[row.blogPostId] = [];
				if (row.tagName) acc[row.blogPostId].push(row.tagName);
				return acc;
			}, {} as Record<number, string[]>);
		}

		const postsWithTags = posts.map((post) => ({
			...post,
			tags: tagsByPostId[post.id] || [],
		}));

		return successResponse(postsWithTags, env, 200);
	} catch (error) {
		console.error('[ADMIN] Database error:', error);
		return errorResponse('Failed to fetch blog posts', env, 500);
	}
});

// GET /api/admin/tags - Get all tags
router.get('/api/admin/tags', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const db = drizzle(env.DB);
		const allTags = await db.select().from(tags).orderBy(tags.name);
		return successResponse(allTags, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch tags', env, 500);
	}
});

// DELETE /api/admin/tags/:id - Delete tag
router.delete('/api/admin/tags/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);

		if (Number.isNaN(id)) {
			console.error('[ADMIN] Invalid tag ID provided:', ctx.params?.id);
			return errorResponse('Invalid tag ID', env, 400);
		}

		const db = drizzle(env.DB);

		// First delete all blog post associations
		await db.delete(blogPostTags).where(eq(blogPostTags.tagId, id));

		// Then delete the tag itself
		const result = await db.delete(tags).where(eq(tags.id, id));

		if (result.meta.changes === 0) {
			console.warn(`[ADMIN] No tag found with ID: ${id}`);
			return errorResponse('Tag not found', env, 404);
		}

		return successResponse({ message: 'Tag deleted' }, env, 200);
	} catch (error) {
		console.error('[ADMIN] Tag delete error:', error);
		return errorResponse('Failed to delete tag', env, 500);
	}
});

// PETS ADMIN ROUTES

// POST /admin/pets - Create new pet
router.post('/api/admin/pets', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const body = await request.json() as {
			name: string;
			species: string;
			breed?: string;
			age?: number;
			color?: string;
			personality?: string;
			specialAbilities?: string;
			favoriteFood?: string;
			favoriteToy?: string;
			originStory?: string;
			description?: string;
			dexId?: string;
			imageUrl?: string;
			iconUrl?: string;
			stats?: string;
			nickname?: string;
			adoptedDate?: string;
			isActive?: boolean;
		};
		const db = drizzle(env.DB);

		const newPet = await db.insert(pets).values({
			name: body.name,
			species: body.species,
			breed: body.breed,
			age: body.age,
			color: body.color,
			personality: body.personality,
			specialAbilities: body.specialAbilities,
			favoriteFood: body.favoriteFood,
			favoriteToy: body.favoriteToy,
			originStory: body.originStory,
			description: body.description,
			dexId: body.dexId,
			imageUrl: body.imageUrl,
			iconUrl: body.iconUrl,
			stats: body.stats,
			nickname: body.nickname,
			adoptedDate: body.adoptedDate,
			isActive: body.isActive !== undefined ? body.isActive : true,
		}).returning();

		return successResponse(newPet[0], env, 201);
	} catch (error) {
		return errorResponse('Failed to create pet', env, 500);
	}
});

// PUT /admin/pets/:id - Update pet
router.put('/api/admin/pets/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);
		const body = await request.json() as {
			name: string;
			species: string;
			breed?: string;
			age?: number;
			color?: string;
			personality?: string;
			specialAbilities?: string;
			favoriteFood?: string;
			favoriteToy?: string;
			originStory?: string;
			description?: string;
			dexId?: string;
			imageUrl?: string;
			iconUrl?: string;
			stats?: string;
			nickname?: string;
			adoptedDate?: string;
			isActive?: boolean;
		};
		const db = drizzle(env.DB);

		const updatedPet = await db.update(pets)
			.set({
				name: body.name,
				species: body.species,
				breed: body.breed,
				age: body.age,
				color: body.color,
				personality: body.personality,
				specialAbilities: body.specialAbilities,
				favoriteFood: body.favoriteFood,
				favoriteToy: body.favoriteToy,
				originStory: body.originStory,
				description: body.description,
				dexId: body.dexId,
				imageUrl: body.imageUrl,
				iconUrl: body.iconUrl,
				stats: body.stats,
				nickname: body.nickname,
				adoptedDate: body.adoptedDate,
				isActive: body.isActive,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(pets.id, id))
			.returning();

		if (!updatedPet.length) {
			return errorResponse('Pet not found', env, 404);
		}

		return successResponse(updatedPet[0], env, 200);
	} catch (error) {
		return errorResponse('Failed to update pet', env, 500);
	}
});

// DELETE /admin/pets/:id - Delete pet
router.delete('/api/admin/pets/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);

		if (Number.isNaN(id)) {
			console.error('[ADMIN] Invalid pet ID provided:', ctx.params?.id);
			return errorResponse('Invalid pet ID', env, 400);
		}

		const db = drizzle(env.DB);

		const result = await db.delete(pets).where(eq(pets.id, id));

		if (result.meta.changes === 0) {
			console.warn(`[ADMIN] No pet found with ID: ${id}`);
			return errorResponse('Pet not found', env, 404);
		}

		return successResponse({ message: 'Pet deleted' }, env, 200);
	} catch (error) {
		console.error('[ADMIN] Pet delete error:', error);
		return errorResponse('Failed to delete pet', env, 500);
	}
});

// GET /admin/pets - Get all pets
router.get('/api/admin/pets', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		console.log('[ADMIN] GET /api/admin/pets called');
		console.log('[ADMIN] Request URL:', request.url);
		console.log('[ADMIN] Request method:', request.method);

		const db = drizzle(env.DB);
		const allPets = await db.select().from(pets).orderBy(desc(pets.createdAt));

		console.log(`[ADMIN] Found ${allPets.length} pets`);
		console.log('[ADMIN] Pet IDs:', allPets.map((pet) => pet.id));

		return successResponse(allPets, env, 200);
	} catch (error) {
		console.error('[ADMIN] Pets database error:', error);
		return errorResponse('Failed to fetch pets', env, 500);
	}
});

// POST /admin/pets/upload-image - Upload pet image to R2
router.post('/api/admin/pets/upload-image', async (request: Request, env: Env) => {
	console.log('[ADMIN] Image upload request received');

	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		console.log('[ADMIN] Parsing form data...');
		const formData = await request.formData();
		const file = formData.get('image') as unknown as File;

		console.log('[ADMIN] File received:', {
			hasFile: !!file,
			fileType: typeof file,
			fileName: file?.name,
			fileSize: file?.size,
			contentType: file?.type,
		});

		if (!file || typeof file !== 'object' || !('type' in file) || !('size' in file) || !('name' in file)) {
			console.log('[ADMIN] Invalid file object:', file);
			return errorResponse('No valid image file provided', env, 400);
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		console.log('[ADMIN] File type:', file.type, 'Allowed types:', allowedTypes);
		if (!allowedTypes.includes(file.type)) {
			return errorResponse('Invalid file type. Only JPEG, PNG, and WebP are allowed.', env, 400);
		}

		// Validate file size (max 10MB)
		const maxSize = 10 * 1024 * 1024; // 10MB
		console.log('[ADMIN] File size:', file.size, 'Max size:', maxSize);
		if (file.size > maxSize) {
			return errorResponse('File too large. Maximum size is 10MB.', env, 400);
		}

		// Generate unique filename
		const timestamp = Date.now();
		const extension = file.name.split('.').pop() || 'jpg';
		const filename = `pet-${timestamp}.${extension}`;
		console.log('[ADMIN] Generated filename:', filename);

		// Upload to R2
		console.log('[ADMIN] Uploading to R2...');
		console.log('[ADMIN] env.PET_IMAGES defined:', !!env.PET_IMAGES);
		console.log('[ADMIN] env.R2_DOMAIN:', env.R2_DOMAIN);
		try {
			const result = await env.PET_IMAGES.put(filename, file.stream(), {
				httpMetadata: {
					contentType: file.type,
				},
			});
			console.log('[ADMIN] R2 put() result:', result);
			console.log('[ADMIN] R2 upload successful:', filename);
		} catch (uploadError) {
			console.error('[ADMIN] R2 upload failed:', uploadError);
			return errorResponse('Failed to upload image to R2', env, 500);
		}

		// Generate public URL using environment variable or fallback
		const baseUrl = env.R2_DOMAIN || 'https://pub-pet-images.r2.dev';
		const imageUrl = `${baseUrl}/${filename}`;
		console.log('[ADMIN] Generated image URL:', imageUrl);

		return successResponse({
			imageUrl,
			filename,
			message: 'Image uploaded successfully',
		}, env, 200);
	} catch (error) {
		console.error('[ADMIN] Image upload error:', error);
		return errorResponse('Failed to upload image', env, 500);
	}
});

// PROJECTS ADMIN ROUTES

// POST /admin/projects - Create new project
router.post('/api/admin/projects', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const body = await request.json() as {
			name: string;
			description?: string;
			projectType: string;
			technologies?: string;
			githubUrl: string;
			liveUrl?: string;
			imageUrl?: string;
		};
		const db = drizzle(env.DB);

		const newProject = await db.insert(projects).values({
			name: body.name,
			description: body.description,
			projectType: body.projectType,
			technologies: body.technologies,
			githubUrl: body.githubUrl,
			liveUrl: body.liveUrl,
			imageUrl: body.imageUrl,
		}).returning();

		return successResponse(newProject[0], env, 201);
	} catch (error) {
		return errorResponse('Failed to create project', env, 500);
	}
});

// PUT /admin/projects/:id - Update project
router.put('/api/admin/projects/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);
		const body = await request.json() as {
			name: string;
			description?: string;
			projectType: string;
			technologies?: string;
			githubUrl: string;
			liveUrl?: string;
			imageUrl?: string;
		};
		const db = drizzle(env.DB);

		const updatedProject = await db.update(projects)
			.set({
				name: body.name,
				description: body.description,
				projectType: body.projectType,
				technologies: body.technologies,
				githubUrl: body.githubUrl,
				liveUrl: body.liveUrl,
				imageUrl: body.imageUrl,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(projects.id, id))
			.returning();

		if (!updatedProject.length) {
			return errorResponse('Project not found', env, 404);
		}

		return successResponse(updatedProject[0], env, 200);
	} catch (error) {
		return errorResponse('Failed to update project', env, 500);
	}
});

// DELETE /admin/projects/:id - Delete project
router.delete('/api/admin/projects/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);

		if (Number.isNaN(id)) {
			console.error('[ADMIN] Invalid project ID provided:', ctx.params?.id);
			return errorResponse('Invalid project ID', env, 400);
		}

		const db = drizzle(env.DB);

		// Then delete the project
		const result = await db.delete(projects).where(eq(projects.id, id));

		if (result.meta.changes === 0) {
			console.warn(`[ADMIN] No project found with ID: ${id}`);
			return errorResponse('Project not found', env, 404);
		}

		return successResponse({ message: 'Project deleted' }, env, 200);
	} catch (error) {
		console.error('[ADMIN] Project delete error:', error);
		return errorResponse('Failed to delete project', env, 500);
	}
});

// GET /admin/projects - Get all projects
router.get('/api/admin/projects', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const db = drizzle(env.DB);
		const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));

		return successResponse(allProjects, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch projects', env, 500);
	}
});

// SKILLS ADMIN ROUTES

// POST /admin/skills - Create new skill
router.post('/api/admin/skills', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const body = await request.json() as {
			name: string;
			category: string;
			proficiency: number;
			icon?: string;
		};
		const db = drizzle(env.DB);

		const newSkill = await db.insert(skills).values({
			name: body.name,
			category: body.category,
			proficiency: body.proficiency,
			icon: body.icon,
		}).returning();

		return successResponse(newSkill[0], env, 201);
	} catch (error) {
		return errorResponse('Failed to create skill', env, 500);
	}
});

// PUT /admin/skills/:id - Update skill
router.put('/api/admin/skills/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);
		console.log('[ADMIN] PUT /api/admin/skills/:id called with id:', id);
		const body = await request.json() as {
			name: string;
			category: string;
			proficiency: number;
			icon?: string;
		};
		console.log('[ADMIN] Request body:', body);
		const db = drizzle(env.DB);

		const updatedSkill = await db.update(skills)
			.set({
				name: body.name,
				category: body.category,
				proficiency: body.proficiency,
				icon: body.icon,
			})
			.where(eq(skills.id, id))
			.returning();

		console.log('[ADMIN] Update result:', updatedSkill);

		if (!updatedSkill.length) {
			console.warn('[ADMIN] Skill not found for update, id:', id);
			return errorResponse('Skill not found', env, 404);
		}

		return successResponse(updatedSkill[0], env, 200);
	} catch (error) {
		console.error('[ADMIN] Failed to update skill:', error);
		return errorResponse('Failed to update skill', env, 500);
	}
});

// DELETE /admin/skills/:id - Delete skill
router.delete('/api/admin/skills/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);

		if (Number.isNaN(id)) {
			console.error('[ADMIN] Invalid skill ID provided:', ctx.params?.id);
			return errorResponse('Invalid skill ID', env, 400);
		}

		const db = drizzle(env.DB);

		const result = await db.delete(skills).where(eq(skills.id, id));

		if (result.meta.changes === 0) {
			console.warn(`[ADMIN] No skill found with ID: ${id}`);
			return errorResponse('Skill not found', env, 404);
		}

		return successResponse({ message: 'Skill deleted' }, env, 200);
	} catch (error) {
		console.error('[ADMIN] Skill delete error:', error);
		return errorResponse('Failed to delete skill', env, 500);
	}
});

// GET /admin/skills - Get all skills
router.get('/api/admin/skills', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const db = drizzle(env.DB);
		const allSkills = await db.select().from(skills).orderBy(desc(skills.createdAt));

		return successResponse(allSkills, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch skills', env, 500);
	}
});

// EXPERIENCE ADMIN ROUTES

// POST /admin/experience - Create new experience
router.post('/api/admin/experience', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const body = await request.json() as {
			company: string;
			position: string;
			description?: string;
			startDate: string;
			endDate?: string;
			current: boolean;
			technologies?: string;
		};
		const db = drizzle(env.DB);

		const newExperience = await db.insert(experience).values({
			company: body.company,
			position: body.position,
			description: body.description,
			startDate: body.startDate,
			endDate: body.endDate,
			current: body.current,
			technologies: body.technologies,
		}).returning();

		return successResponse(newExperience[0], env, 201);
	} catch (error) {
		return errorResponse('Failed to create experience', env, 500);
	}
});

// PUT /admin/experience/:id - Update experience
router.put('/api/admin/experience/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);
		const body = await request.json() as {
			company: string;
			position: string;
			description?: string;
			startDate: string;
			endDate?: string;
			current: boolean;
			technologies?: string;
		};
		const db = drizzle(env.DB);

		const updatedExperience = await db.update(experience)
			.set({
				company: body.company,
				position: body.position,
				description: body.description,
				startDate: body.startDate,
				endDate: body.endDate,
				current: body.current,
				technologies: body.technologies,
			})
			.where(eq(experience.id, id))
			.returning();

		if (!updatedExperience.length) {
			return errorResponse('Experience not found', env, 404);
		}

		return successResponse(updatedExperience[0], env, 200);
	} catch (error) {
		return errorResponse('Failed to update experience', env, 500);
	}
});

// DELETE /admin/experience/:id - Delete experience
router.delete('/api/admin/experience/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);

		if (Number.isNaN(id)) {
			console.error('[ADMIN] Invalid experience ID provided:', ctx.params?.id);
			return errorResponse('Invalid experience ID', env, 400);
		}

		const db = drizzle(env.DB);

		const result = await db.delete(experience).where(eq(experience.id, id));

		if (result.meta.changes === 0) {
			console.warn(`[ADMIN] No experience found with ID: ${id}`);
			return errorResponse('Experience not found', env, 404);
		}

		return successResponse({ message: 'Experience deleted' }, env, 200);
	} catch (error) {
		console.error('[ADMIN] Experience delete error:', error);
		return errorResponse('Failed to delete experience', env, 500);
	}
});

// GET /admin/experience - Get all experience
router.get('/api/admin/experience', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const db = drizzle(env.DB);
		const allExperience = await db.select().from(experience).orderBy(desc(experience.createdAt));

		return successResponse(allExperience, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch experience', env, 500);
	}
});

// TESTIMONIALS ADMIN ROUTES

// POST /admin/testimonials - Create new testimonial
router.post('/api/admin/testimonials', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const body = await request.json() as {
			clientName: string;
			clientTitle?: string;
			clientCompany?: string;
			content: string;
			rating?: number;
			relationship: string;
			status?: string;
		};
		const db = drizzle(env.DB);

		const newTestimonial = await db.insert(testimonials).values({
			clientName: body.clientName,
			clientTitle: body.clientTitle,
			clientCompany: body.clientCompany,
			content: body.content,
			rating: body.rating,
			relationship: body.relationship,
			status: body.status || 'needs_review',
		}).returning();

		return successResponse(newTestimonial[0], env, 201);
	} catch (error) {
		return errorResponse('Failed to create testimonial', env, 500);
	}
});

// PUT /admin/testimonials/:id - Update testimonial
router.put('/api/admin/testimonials/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);
		const body = await request.json() as {
			clientName?: string;
			clientTitle?: string;
			clientCompany?: string;
			content?: string;
			rating?: number;
			relationship?: string;
			status?: string;
		};
		const db = drizzle(env.DB);

		const updatedTestimonial = await db.update(testimonials)
			.set({
				...(body.clientName !== undefined && { clientName: body.clientName }),
				...(body.clientTitle !== undefined && { clientTitle: body.clientTitle }),
				...(body.clientCompany !== undefined && { clientCompany: body.clientCompany }),
				...(body.content !== undefined && { content: body.content }),
				...(body.rating !== undefined && { rating: body.rating }),
				...(body.relationship !== undefined && { relationship: body.relationship }),
				...(body.status !== undefined && { status: body.status }),
			})
			.where(eq(testimonials.id, id))
			.returning();

		if (!updatedTestimonial.length) {
			return errorResponse('Testimonial not found', env, 404);
		}

		return successResponse(updatedTestimonial[0], env, 200);
	} catch (error) {
		return errorResponse('Failed to update testimonial', env, 500);
	}
});

// DELETE /admin/testimonials/:id - Delete testimonial
router.delete('/api/admin/testimonials/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);

		if (Number.isNaN(id)) {
			console.error('[ADMIN] Invalid testimonial ID provided:', ctx.params?.id);
			return errorResponse('Invalid testimonial ID', env, 400);
		}

		const db = drizzle(env.DB);

		const result = await db.delete(testimonials).where(eq(testimonials.id, id));

		if (result.meta.changes === 0) {
			console.warn(`[ADMIN] No testimonial found with ID: ${id}`);
			return errorResponse('Testimonial not found', env, 404);
		}

		return successResponse({ message: 'Testimonial deleted' }, env, 200);
	} catch (error) {
		console.error('[ADMIN] Testimonial delete error:', error);
		return errorResponse('Failed to delete testimonial', env, 500);
	}
});

// GET /admin/testimonials - Get all testimonials
router.get('/api/admin/testimonials', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const db = drizzle(env.DB);
		const allTestimonials = await db.select()
			.from(testimonials)
			.orderBy(desc(testimonials.createdAt));

		return successResponse(allTestimonials, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch testimonials', env, 500);
	}
});

// CERTIFICATIONS ADMIN ROUTES

// POST /admin/certifications - Create new certification
router.post('/api/admin/certifications', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const body = await request.json() as {
			name: string;
			issuer: string;
			issueDate: string;
			expiryDate?: string;
			credentialId?: string;
			credentialUrl?: string;
			description?: string;
			category?: string;
			imageUrl?: string;
		};
		const db = drizzle(env.DB);

		const newCertification = await db.insert(certifications).values({
			name: body.name,
			issuer: body.issuer,
			issueDate: body.issueDate,
			expiryDate: body.expiryDate,
			credentialId: body.credentialId,
			credentialUrl: body.credentialUrl,
			description: body.description,
			category: body.category,
			imageUrl: body.imageUrl,
		}).returning();

		return successResponse(newCertification[0], env, 201);
	} catch (error) {
		return errorResponse('Failed to create certification', env, 500);
	}
});

// PUT /admin/certifications/:id - Update certification
router.put('/api/admin/certifications/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);
		const body = await request.json() as {
			name: string;
			issuer: string;
			issueDate: string;
			expiryDate?: string;
			credentialId?: string;
			credentialUrl?: string;
			description?: string;
			category?: string;
			imageUrl?: string;
		};
		const db = drizzle(env.DB);

		const updatedCertification = await db.update(certifications)
			.set({
				name: body.name,
				issuer: body.issuer,
				issueDate: body.issueDate,
				expiryDate: body.expiryDate,
				credentialId: body.credentialId,
				credentialUrl: body.credentialUrl,
				description: body.description,
				category: body.category,
				imageUrl: body.imageUrl,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(certifications.id, id))
			.returning();

		if (!updatedCertification.length) {
			return errorResponse('Certification not found', env, 404);
		}

		return successResponse(updatedCertification[0], env, 200);
	} catch (error) {
		return errorResponse('Failed to update certification', env, 500);
	}
});

// DELETE /admin/certifications/:id - Delete certification
router.delete('/api/admin/certifications/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);

		if (Number.isNaN(id)) {
			console.error('[ADMIN] Invalid certification ID provided:', ctx.params?.id);
			return errorResponse('Invalid certification ID', env, 400);
		}

		const db = drizzle(env.DB);

		const result = await db.delete(certifications).where(eq(certifications.id, id));

		if (result.meta.changes === 0) {
			console.warn(`[ADMIN] No certification found with ID: ${id}`);
			return errorResponse('Certification not found', env, 404);
		}

		return successResponse({ message: 'Certification deleted' }, env, 200);
	} catch (error) {
		console.error('[ADMIN] Certification delete error:', error);
		return errorResponse('Failed to delete certification', env, 500);
	}
});

// GET /admin/certifications - Get all certifications
router.get('/api/admin/certifications', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const db = drizzle(env.DB);
		const allCertifications = await db.select()
			.from(certifications)
			.orderBy(desc(certifications.createdAt));

		return successResponse(allCertifications, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch certifications', env, 500);
	}
});

// TESTIMONIAL INVITES ADMIN ROUTES
// POST /api/admin/testimonial-invites - Create new invite
router.post('/api/admin/testimonial-invites', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const body = await request.json() as { name?: string; email?: string; expiresAt?: string };
		const db = drizzle(env.DB);
		const token = crypto.randomUUID();
		const invite = await db.insert(testimonialInvites).values({
			token,
			name: body.name,
			email: body.email,
			expiresAt: body.expiresAt,
		}).returning();
		return successResponse(invite[0], env, 201);
	} catch (error) {
		return errorResponse('Failed to create testimonial invite', env, 500);
	}
});

// GET /api/admin/testimonial-invites - List all invites
router.get('/api/admin/testimonial-invites', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const db = drizzle(env.DB);
		const invites = await db.select().from(testimonialInvites);
		return successResponse(invites, env, 200);
	} catch (error) {
		return errorResponse('Failed to fetch testimonial invites', env, 500);
	}
});

// DELETE /api/admin/testimonial-invites/:id - Delete an invite
router.delete('/api/admin/testimonial-invites/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const url = new URL(request.url);
		const pathParts = url.pathname.split('/');
		const idFromPath = pathParts[pathParts.length - 1];
		const id = parseInt(ctx.params?.id || idFromPath, 10);
		if (Number.isNaN(id)) return errorResponse('Invalid invite ID', env, 400);
		const db = drizzle(env.DB);
		const result = await db.delete(testimonialInvites).where(eq(testimonialInvites.id, id));
		if (result.meta.changes === 0) return errorResponse('Invite not found', env, 404);
		return successResponse({ message: 'Invite deleted' }, env, 200);
	} catch (error) {
		return errorResponse('Failed to delete testimonial invite', env, 500);
	}
});

// IMAGE UPLOAD ROUTES

// POST /admin/upload-image - Upload image for blog posts
router.post('/api/admin/upload-image', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const formData = await request.formData();
		const imageFile = formData.get('image') as unknown as File;

		if (!imageFile) {
			return errorResponse('No image file provided', env, 400);
		}

		// Validate file type
		if (!imageFile.type.startsWith('image/')) {
			return errorResponse('File must be an image', env, 400);
		}

		// Validate file size (5MB limit)
		if (imageFile.size > 5 * 1024 * 1024) {
			return errorResponse('Image file too large (max 5MB)', env, 400);
		}

		// Generate unique filename
		const timestamp = Date.now();
		const extension = imageFile.name.split('.').pop() || 'jpg';
		const filename = `blog-images/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;

		// Upload to R2
		await env.PET_IMAGES.put(filename, imageFile.stream(), {
			httpMetadata: {
				contentType: imageFile.type,
			},
		});

		// Generate public URL
		const imageUrl = env.R2_DOMAIN ? `${env.R2_DOMAIN}/${filename}` : `/api/images/${filename}`;

		return successResponse({ url: imageUrl }, env, 200);
	} catch (error) {
		console.error('[ADMIN] Image upload error:', error);
		return errorResponse('Failed to upload image', env, 500);
	}
});

// COMMENTS ADMIN ROUTES

// GET /api/admin/comments - Get all comments with filtering
router.get('/api/admin/comments', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const { searchParams } = new URL(request.url);
		const blogSlug = searchParams.get('blogSlug');
		const page = parseInt(searchParams.get('page') || '1', 10);
		const limit = parseInt(searchParams.get('limit') || '50', 10);
		const offset = (page - 1) * limit;

		const db = drizzle(env.DB);

		// Build where clause
		const whereClause = blogSlug
			? and(eq(comments.isDeleted, false), eq(comments.blogSlug, blogSlug))
			: eq(comments.isDeleted, false);

		// Get comments with user info
		const commentsWithUsers = await db
			.select({
				id: comments.id,
				blogSlug: comments.blogSlug,
				userId: comments.userId,
				parentId: comments.parentId,
				content: comments.content,
				createdAt: comments.createdAt,
				updatedAt: comments.updatedAt,
				isEdited: comments.isEdited,
				isDeleted: comments.isDeleted,
				user: {
					id: users.id,
					displayName: users.displayName,
					photoUrl: users.photoUrl,
					githubUsername: users.githubUsername,
					role: users.role,
				},
			})
			.from(comments)
			.leftJoin(users, eq(comments.userId, users.id))
			.where(whereClause)
			.orderBy(desc(comments.createdAt))
			.limit(limit)
			.offset(offset);

		// Get vote counts for all comments
		const commentIds = commentsWithUsers.map((comment) => comment.id);
		const voteCounts = commentIds.length > 0 ? await db
			.select({
				commentId: votes.commentId,
				voteCount: sum(votes.voteType),
			})
			.from(votes)
			.where(inArray(votes.commentId, commentIds))
			.groupBy(votes.commentId) : [];

		// Combine comments with vote counts
		const commentsWithVotes = commentsWithUsers.map((comment) => {
			const voteData = voteCounts.find((v) => v.commentId === comment.id);
			return {
				...comment,
				voteCount: voteData?.voteCount || 0,
			};
		});

		return successResponse(commentsWithVotes, env);
	} catch (error) {
		console.error('Error fetching admin comments:', error);
		return errorResponse('Failed to fetch comments', env, 500);
	}
});

// DELETE /api/admin/comments/:id - Admin delete comment
router.delete('/api/admin/comments/:id', async (request: Request, env: Env, ctx: any) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		let id = ctx && ctx.params ? ctx.params.id : undefined;
		if (!id) {
			const url = new URL(request.url);
			const pathParts = url.pathname.split('/');
			id = pathParts[pathParts.length - 1];
		}

		const db = drizzle(env.DB);

		// Soft delete the comment
		await db
			.update(comments)
			.set({
				isDeleted: true,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(comments.id, id));

		return successResponse({ message: 'Comment deleted successfully' }, env);
	} catch (error) {
		console.error('Error deleting comment:', error);
		return errorResponse('Failed to delete comment', env, 500);
	}
});

// GET /api/admin/comments/blog-slugs - Get all unique blog slugs
router.get('/api/admin/comments/blog-slugs', async (request: Request, env: Env) => {
	const authCheck = requireAdmin(request, env);
	if (authCheck) return authCheck;

	try {
		const db = drizzle(env.DB);

		const blogSlugs = await db
			.selectDistinct({ blogSlug: comments.blogSlug })
			.from(comments)
			.where(eq(comments.isDeleted, false))
			.orderBy(comments.blogSlug);

		return successResponse(blogSlugs.map((slug) => slug.blogSlug), env);
	} catch (error) {
		console.error('Error fetching blog slugs:', error);
		return errorResponse('Failed to fetch blog slugs', env, 500);
	}
});

// Add a 404 handler as the last route
router.all('*', (_: Request, env: Env) => new Response(JSON.stringify({ error: 'Not Found' }), {
	status: 404,
	headers: env ? getCorsHeaders(env) : { 'Content-Type': 'application/json' },
}));

export default router;
