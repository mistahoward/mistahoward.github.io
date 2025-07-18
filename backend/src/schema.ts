import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const ProjectType = {
	PROFESSIONAL: 'professional',
	PERSONAL: 'personal',
	ACADEMIC: 'academic',
} as const;

export const projects = sqliteTable('Projects', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	projectType: text('project_type').notNull().default(ProjectType.PERSONAL),
	technologies: text('technologies'), // JSON array of technologies
	githubUrl: text('github_url').notNull(),
	liveUrl: text('live_url'),
	imageUrl: text('image_url'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Blog posts table schema
export const blogPosts = sqliteTable('BlogPosts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	content: text('content').notNull(),
	excerpt: text('excerpt'),
	published: integer('published', { mode: 'boolean' }).default(false),
	publishedAt: text('published_at'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Skills table schema
export const skills = sqliteTable('Skills', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	category: text('category').notNull(), // 'frontend', 'backend', 'devops', etc.
	proficiency: integer('proficiency').notNull(), // 1-5 scale
	icon: text('icon'), // Icon class or URL
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Experience table schema
export const experience = sqliteTable('Experience', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	company: text('company').notNull(),
	position: text('position').notNull(),
	description: text('description'),
	startDate: text('start_date').notNull(),
	endDate: text('end_date'), // null for current position
	current: integer('current', { mode: 'boolean' }).default(false),
	technologies: text('technologies'), // JSON array
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Testimonials table schema (example of adding a new table)
export const testimonials = sqliteTable('Testimonials', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	clientName: text('client_name').notNull(),
	clientTitle: text('client_title'),
	clientCompany: text('client_company'),
	content: text('content').notNull(),
	rating: integer('rating'), // 1-5 stars
	relationship: text('relationship').notNull(), // How you know Alex
	status: text('status').notNull().default('needs_review'), // 'needs_review', 'approved', 'denied'
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Certifications table schema
export const certifications = sqliteTable('Certifications', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	issuer: text('issuer').notNull(),
	issueDate: text('issue_date').notNull(),
	expiryDate: text('expiry_date'), // null for certifications that don't expire
	credentialId: text('credential_id'), // certificate ID or URL
	credentialUrl: text('credential_url'), // URL to verify the certification
	description: text('description'),
	category: text('category'), // 'cloud', 'security', 'development', etc.
	imageUrl: text('image_url'), // logo or badge image
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Pets table schema (Pet-dex!)
export const pets = sqliteTable('Pets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	species: text('species').notNull(), // "cat" or "dog"
	breed: text('breed'),
	age: integer('age'), // in years
	color: text('color'),
	personality: text('personality'), // JSON array of traits
	specialAbilities: text('special_abilities'), // JSON array of fun abilities
	favoriteFood: text('favorite_food'),
	favoriteToy: text('favorite_toy'),
	originStory: text('origin_story'), // Renamed from rescue_story
	description: text('description'), // New field for pet description
	dexId: text('dex_id'), // Independent PetDex identifier
	imageUrl: text('image_url'), // Main pet image
	iconUrl: text('icon_url'), // Icon for PetDex (like Pokédex)
	stats: text('stats'), // JSON object with HP, Attack, Defense, Speed, etc.
	nickname: text('nickname'),
	adoptedDate: text('adopted_date'),
	isActive: integer('is_active', { mode: 'boolean' }).default(true), // for pets that have passed
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Testimonial invite tokens table
export const testimonialInvites = sqliteTable('TestimonialInvites', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	token: text('token').notNull().unique(),
	email: text('email'),
	name: text('name'),
	used: integer('used', { mode: 'boolean' }).default(false),
	usedAt: text('used_at'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	expiresAt: text('expires_at'),
});

// Type exports for use in your application
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type Experience = typeof experience.$inferSelect;
export type NewExperience = typeof experience.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type Certification = typeof certifications.$inferSelect;
export type NewCertification = typeof certifications.$inferInsert;
export type Pet = typeof pets.$inferSelect;
export type NewPet = typeof pets.$inferInsert;
