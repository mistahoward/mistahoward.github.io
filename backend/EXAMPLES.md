# Code-First Migration Examples

This file shows common patterns for modifying your database schema using the code-first approach with TypeScript.

## Adding a New Table

### 1. Edit `src/schema.ts`
```typescript
// Add this to your schema file
export const testimonials = sqliteTable('Testimonials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientName: text('client_name').notNull(),
  content: text('content').notNull(),
  rating: integer('rating'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});
```

### 2. Run Migration
```bash
npm run db:workflow
```

## Adding a Column to Existing Table

### 1. Edit `src/schema.ts`
```typescript
// Modify the projects table
export const projects = sqliteTable('Projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  technologies: text('technologies'),
  githubUrl: text('github_url'),
  liveUrl: text('live_url'),
  imageUrl: text('image_url'),
  // NEW COLUMN
  featured: integer('featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});
```

### 2. Run Migration
```bash
npm run db:workflow
```

## Adding Foreign Key Relationship

### 1. Edit `src/schema.ts`
```typescript
export const projects = sqliteTable('Projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // ... other fields
});

export const projectImages = sqliteTable('ProjectImages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id), // Foreign key
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text'),
  order: integer('order').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});
```

### 2. Run Migration
```bash
npm run db:workflow
```

## Using the New Schema in Your Code

### Type-Safe Queries
```typescript
import { drizzle } from 'drizzle-orm/d1';
import { projects, testimonials, eq, desc } from './schema';

// Get featured projects
const featuredProjects = await db.select()
  .from(projects)
  .where(eq(projects.featured, true))
  .orderBy(desc(projects.createdAt));

// Get testimonials with project info
const testimonialsWithProjects = await db.select({
  testimonial: testimonials,
  project: projects
})
.from(testimonials)
.leftJoin(projects, eq(testimonials.projectId, projects.id))
.where(eq(testimonials.approved, true));
```

## Migration Commands

```bash
# Generate SQL from TypeScript schema
npm run db:generate

# Apply migrations to local database
npm run db:migrate

# Complete workflow (generate + migrate)
npm run db:workflow

# Open database studio (visual browser)
npm run db:studio

# Drop all tables (reset database)
npm run db:drop
```

## Best Practices

1. **Always backup** your data before running migrations
2. **Test migrations** on local database first
3. **Use descriptive names** for tables and columns
4. **Add indexes** for frequently queried columns
5. **Use foreign keys** to maintain data integrity
6. **Add timestamps** to track record changes 