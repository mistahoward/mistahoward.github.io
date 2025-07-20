import { Router } from 'itty-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, inArray, sum } from 'drizzle-orm';
import { users, comments, votes } from '../schema';
import { requireAuth, errorResponse, successResponse } from '../middleware/auth';
import { rateLimits } from '../middleware/rate-limit';
import { contentValidators } from '../middleware/content-validation';
import { perspectiveValidators } from '../middleware/perspective-api';
import { v4 as uuidv4 } from 'uuid';
import { initializeFirebaseAdmin } from '../utils/firebase-admin';

interface Env {
	DB: D1Database;
}

const router = Router();

// Get comments for a blog post
router.get('/api/comments/:blogSlug', async (request: Request, env: Env, ctx: any) => {
	// Initialize Firebase Admin
	initializeFirebaseAdmin(env);

	try {
		let blogSlug = ctx && ctx.params ? ctx.params.blogSlug : undefined;
		if (!blogSlug) {
			const url = new URL(request.url);
			blogSlug = url.pathname.split('/').pop();
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1', 10);
		const limit = parseInt(searchParams.get('limit') || '10', 10);
		const offset = (page - 1) * limit;
		const userId = searchParams.get('userId'); // We'll pass this from frontend

		const db = drizzle(env.DB);

		// Get ALL comments with user info (including replies)
		const allCommentsWithUsers = await db
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
			.where(
				and(
					eq(comments.blogSlug, blogSlug),
					eq(comments.isDeleted, false)
				)
			)
			.orderBy(desc(comments.createdAt));

		// Separate top-level comments and replies
		const topLevelComments = allCommentsWithUsers.filter((comment) => !comment.parentId);
		const replies = allCommentsWithUsers.filter((comment) => comment.parentId);

		// Apply pagination to top-level comments only
		const paginatedTopLevelComments = topLevelComments.slice(offset, offset + limit);

		// Get vote counts for all comments (including replies)
		const allCommentIds = allCommentsWithUsers.map(comment => comment.id);
		const voteCounts = allCommentIds.length > 0 ? await db
			.select({
				commentId: votes.commentId,
				voteCount: sum(votes.voteType),
			})
			.from(votes)
			.where(inArray(votes.commentId, allCommentIds))
			.groupBy(votes.commentId) : [];

		// Get current user's votes for all comments
		console.log('Fetching user votes for userId:', userId, 'commentIds:', allCommentIds);
		const userVotes = userId && allCommentIds.length > 0 ? await db
			.select({
				commentId: votes.commentId,
				voteType: votes.voteType,
			})
			.from(votes)
			.where(and(
				inArray(votes.commentId, allCommentIds),
				eq(votes.userId, userId)
			)) : [];

		console.log('Found user votes:', userVotes);

		// Combine all comments with vote counts and user's current vote
		const allCommentsWithVotes = allCommentsWithUsers.map(comment => {
			const voteData = voteCounts.find(v => v.commentId === comment.id);
			const userVote = userVotes.find(v => v.commentId === comment.id);
			return {
				...comment,
				voteCount: voteData?.voteCount || 0,
				userVote: userVote?.voteType || 0, // 0 = no vote, 1 = upvote, -1 = downvote
			};
		});

		// Build nested structure
		const buildNestedComments = (parentId: string | null = null): any[] => {
			const levelComments = allCommentsWithVotes.filter(comment => comment.parentId === parentId);
			return levelComments.map(comment => ({
				...comment,
				replies: buildNestedComments(comment.id)
			}));
		};

		// Get paginated top-level comments with their nested replies
		const paginatedCommentsWithReplies = buildNestedComments().slice(offset, offset + limit);

		return successResponse(paginatedCommentsWithReplies, env);
	} catch (error) {
		console.error('Error fetching comments:', error);
		return errorResponse('Failed to fetch comments', env, 500);
	}
});

// Create a new comment
router.post('/api/comments', async (request: Request, env: Env) => {
	// Initialize Firebase Admin
	initializeFirebaseAdmin(env);

	try {
		// Apply rate limiting for comment creation
		const rateLimitResult = await rateLimits.commentCreation(request, env);
		if (rateLimitResult) return rateLimitResult;

		// Check authentication
		const authResult = await requireAuth(request);
		if (authResult) return authResult;

		// Apply basic content validation (length, URLs, etc.)
		const contentValidationResult = await contentValidators.commentCreation(request, env);
		if (contentValidationResult) return contentValidationResult;

		// Apply Perspective API content moderation
		const perspectiveValidationResult = await perspectiveValidators.commentCreation(request, env);
		if (perspectiveValidationResult) return perspectiveValidationResult;

		const user = (request as any).user;
		const body = (await request.json()) as {
			blogSlug: string;
			content: string;
			parentId?: string;
			githubUsername?: string;
		};
		const { blogSlug, content, parentId, githubUsername: providedGithubUsername } = body;

		if (!blogSlug) {
			return errorResponse('Blog slug is required', env, 400);
		}

		const db = drizzle(env.DB);
		const commentId = uuidv4();

		// Extract GitHub username from various possible sources
		let githubUsername = providedGithubUsername || '';

		// If not provided by frontend, try to extract from user data
		if (!githubUsername) {
			// Try to get from display name first (most reliable for GitHub users)
			if (user.displayName && !user.displayName.includes(' ') && !user.displayName.includes('@')) {
				githubUsername = user.displayName;
			}
			// Try to get from email (GitHub format: username@users.noreply.github.com)
			else if (user.email && user.email.includes('@users.noreply.github.com')) {
				githubUsername = user.email.split('@')[0];
			}
			// Try to get from photo URL (GitHub avatar URLs contain username)
			else if (user.photoURL && user.photoURL.includes('githubusercontent.com')) {
				const urlParts = user.photoURL.split('/');
				// Look for the 'u' path which contains the username
				const uIndex = urlParts.findIndex(part => part === 'u');
				if (uIndex > 0 && uIndex + 1 < urlParts.length) {
					const potentialUsername = urlParts[uIndex + 1];
					// Remove query parameters if present
					githubUsername = potentialUsername.split('?')[0];
				}
			}
			// Try to get from provider data if available
			else if (user.providerData && user.providerData.length > 0) {
				const githubProvider = user.providerData.find(provider => provider.providerId === 'github.com');
				if (githubProvider && githubProvider.uid) {
					githubUsername = githubProvider.uid;
				}
			}
			// Try to get from custom claims or additional user info
			else if (user.additionalUserInfo && user.additionalUserInfo.profile) {
				const profile = user.additionalUserInfo.profile as any;
				if (profile.login) {
					githubUsername = profile.login;
				}
			}
		}

		// Determine user role - check multiple identifiers for admin
		const isAdmin =
			githubUsername === 'mistahoward' ||
			user.email?.includes('mistahoward') ||
			user.displayName?.toLowerCase().includes('mistahoward') ||
			user.uid === '6iB3ZSjic5aBSklmUsrzkk9Prkl2'; // Your specific Firebase UID

		const userRole = isAdmin ? 'admin' : 'user';

		console.log('User info:', {
			uid: user.uid,
			email: user.email,
			displayName: user.displayName,
			photoURL: user.photoURL,
			extractedGithubUsername: githubUsername,
			role: userRole,
			isAdmin,
			providerData: user.providerData,
			additionalUserInfo: user.additionalUserInfo
		});

		console.log('Raw user object from request:', user);

		// Create or update user record
		await db
			.insert(users)
			.values({
				id: user.uid,
				displayName: user.displayName || 'Anonymous',
				photoUrl: user.photoURL,
				githubUsername,
				role: userRole,
			})
			.onConflictDoUpdate({
				target: users.id,
				set: {
					displayName: user.displayName || 'Anonymous',
					photoUrl: user.photoURL,
					githubUsername,
					role: userRole,
					updatedAt: new Date().toISOString(),
				},
			});

		// Create comment
		await db
			.insert(comments)
			.values({
				id: commentId,
				blogSlug,
				userId: user.uid,
				parentId: parentId || null,
				content,
			});

		// Fetch the created comment with user info
		const newCommentWithUser = await db
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
			.where(eq(comments.id, commentId))
			.limit(1);

		return successResponse(newCommentWithUser[0], env, 201);
	} catch (error) {
		console.error('Error creating comment:', error);
		return errorResponse('Failed to create comment', env, 500);
	}
});

// Update a comment
router.put('/api/comments/:id', async (request: Request, env: Env, ctx: any) => {
	try {
		// Check authentication
		const authResult = await requireAuth(request);
		if (authResult) return authResult;

		// Apply basic content validation (length, URLs, etc.)
		const contentValidationResult = await contentValidators.commentUpdate(request, env);
		if (contentValidationResult) return contentValidationResult;

		// Apply Perspective API content moderation
		const perspectiveValidationResult = await perspectiveValidators.commentUpdate(request, env);
		if (perspectiveValidationResult) return perspectiveValidationResult;

		const user = (request as any).user;
		let id = ctx && ctx.params ? ctx.params.id : undefined;
		if (!id) {
			const url = new URL(request.url);
			const pathParts = url.pathname.split('/');
			// For /api/comments/:id, the ID is the last part
			id = pathParts[pathParts.length - 1];
		}

		const body = (await request.json()) as {
			content: string;
		};
		const { content } = body;

		if (!content) {
			return errorResponse('Content is required', env, 400);
		}

		const db = drizzle(env.DB);

		// Check if comment exists and user owns it
		const existingComment = await db
			.select()
			.from(comments)
			.where(eq(comments.id, id))
			.limit(1);

		if (!existingComment.length) {
			return errorResponse('Comment not found', env, 404);
		}

		if (existingComment[0].userId !== user.uid) {
			return errorResponse('Unauthorized - You can only edit your own comments', env, 403);
		}

		// Update comment
		const updatedComment = await db
			.update(comments)
			.set({
				content,
				isEdited: true,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(comments.id, id))
			.returning();

		return successResponse(updatedComment[0], env);
	} catch (error) {
		console.error('Error updating comment:', error);
		return errorResponse('Failed to update comment', env, 500);
	}
});

// Delete a comment (soft delete)
router.delete('/api/comments/:id', async (request: Request, env: Env, ctx: any) => {
	try {
		// Check authentication
		const authResult = await requireAuth(request);
		if (authResult) return authResult;

		const user = (request as any).user;
		let id = ctx && ctx.params ? ctx.params.id : undefined;
		if (!id) {
			const url = new URL(request.url);
			const pathParts = url.pathname.split('/');
			// For /api/comments/:id, the ID is the last part
			id = pathParts[pathParts.length - 1];
		}

		const db = drizzle(env.DB);

		// Check if comment exists and user owns it
		const existingComment = await db
			.select()
			.from(comments)
			.where(eq(comments.id, id))
			.limit(1);

		if (!existingComment.length) {
			return errorResponse('Comment not found', env, 404);
		}

		if (existingComment[0].userId !== user.uid) {
			return errorResponse('Unauthorized - You can only delete your own comments', env, 403);
		}

		// Soft delete comment
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

// Vote on a comment
router.post('/api/comments/:id/vote', async (request: Request, env: Env, ctx: any) => {
	try {
		// Apply rate limiting for voting
		const rateLimitResult = await rateLimits.voting(request, env);
		if (rateLimitResult) return rateLimitResult;

		// Check authentication
		const authResult = await requireAuth(request);
		if (authResult) return authResult;

		const user = (request as any).user;
		let id = ctx && ctx.params ? ctx.params.id : undefined;
		if (!id) {
			const url = new URL(request.url);
			const pathParts = url.pathname.split('/');
			// For /api/comments/:id/vote, the ID is the second-to-last part
			id = pathParts[pathParts.length - 2];
		}

		const body = (await request.json()) as {
			voteType: number;
		};
		const { voteType } = body; // 1 for upvote, -1 for downvote

		if (!voteType || ![1, -1].includes(voteType)) {
			return errorResponse('Vote type must be 1 (upvote) or -1 (downvote)', env, 400);
		}

		const db = drizzle(env.DB);

		// Check if comment exists
		const existingComment = await db
			.select()
			.from(comments)
			.where(eq(comments.id, id))
			.limit(1);

		if (!existingComment.length) {
			return errorResponse('Comment not found', env, 404);
		}

		// Check if user already voted
		const existingVote = await db
			.select()
			.from(votes)
			.where(and(eq(votes.commentId, id), eq(votes.userId, user.uid)))
			.limit(1);

		if (existingVote.length) {
			if (existingVote[0].voteType === voteType) {
				// User is clicking the same vote button, remove the vote
				await db
					.delete(votes)
					.where(and(eq(votes.commentId, id), eq(votes.userId, user.uid)));
			} else {
				// User is changing their vote, update it
				await db
					.update(votes)
					.set({
						voteType,
						updatedAt: new Date().toISOString(),
					})
					.where(and(eq(votes.commentId, id), eq(votes.userId, user.uid)));
			}
		} else {
			// Create new vote
			await db
				.insert(votes)
				.values({
					id: uuidv4(),
					commentId: id,
					userId: user.uid,
					voteType,
				});
		}

		return successResponse({ message: 'Vote recorded successfully' }, env);
	} catch (error) {
		console.error('Error voting on comment:', error);
		return errorResponse('Failed to record vote', env, 500);
	}
});

// Remove vote from a comment
router.delete('/api/comments/:id/vote', async (request: Request, env: Env, ctx: any) => {
	try {
		// Check authentication
		const authResult = await requireAuth(request);
		if (authResult) return authResult;

		const user = (request as any).user;
		let id = ctx && ctx.params ? ctx.params.id : undefined;
		if (!id) {
			const url = new URL(request.url);
			const pathParts = url.pathname.split('/');
			// For /api/comments/:id/vote, the ID is the second-to-last part
			id = pathParts[pathParts.length - 2];
		}

		const db = drizzle(env.DB);

		// Remove vote
		await db
			.delete(votes)
			.where(and(eq(votes.commentId, id), eq(votes.userId, user.uid)));

		return successResponse({ message: 'Vote removed successfully' }, env);
	} catch (error) {
		console.error('Error removing vote:', error);
		return errorResponse('Failed to remove vote', env, 500);
	}
});

export default router; 