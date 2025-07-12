# Portfolio API Backend

A Cloudflare Worker backend with D1 database and Drizzle ORM for the portfolio website.

## Features

- TypeScript-based Cloudflare Worker
- D1 database integration with Drizzle ORM
- Type-safe database queries and schema
- RESTful API with itty-router
- Local development setup
- Database migrations and schema management

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Wrangler
Before running the development server, you need to:

1. **Login to Cloudflare** (if not already logged in):
   ```bash
   npx wrangler login
   ```

2. **Create a D1 Database**:
   ```bash
   npx wrangler d1 create portfolio-db-preview
   ```

3. **Update the database ID** in `wrangler.toml` with the ID from the previous command.

### 3. Code-First Migration Workflow
```bash
# Generate SQL from TypeScript schema and apply migrations
npm run db:workflow
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. (Optional) Open Database Studio
```bash
npm run db:studio
```

## Code-First Migration Workflow

Instead of writing raw SQL, you define your database schema in TypeScript:

### 1. Edit Schema (`src/schema.ts`)
```typescript
// Add a new table
export const testimonials = sqliteTable('Testimonials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientName: text('client_name').notNull(),
  content: text('content').notNull(),
  rating: integer('rating'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});
```

### 2. Generate & Apply Migrations
```bash
npm run db:workflow
```

This automatically:
- ✅ Generates SQL migration files from your TypeScript schema
- ✅ Applies migrations to your local database
- ✅ Keeps your database in sync with your code
- ✅ No JavaScript files - pure TypeScript workflow

### 3. Use in Your Code
```typescript
import { testimonials } from './schema';

// Type-safe queries
const allTestimonials = await db.select().from(testimonials);
const approvedTestimonials = await db.select()
  .from(testimonials)
  .where(eq(testimonials.approved, true));
```

The server will be available at `http://localhost:8787`

## API Endpoints

### GET /projects
Returns a list of portfolio projects.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Portfolio Website",
    "description": "A modern portfolio website built with Preact and TypeScript",
    "technologies": ["Preact", "TypeScript", "Vite"],
    "githubUrl": "https://github.com/example/portfolio",
    "liveUrl": "https://example.com"
  }
]
```

### GET /blog
Get all published blog posts.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Building a Portfolio with Cloudflare Workers",
    "slug": "building-portfolio-cloudflare-workers",
    "content": "Full blog post content...",
    "excerpt": "Learn how to build a modern portfolio...",
    "published": true,
    "publishedAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### GET /blog/:slug
Get a specific blog post by slug.

### GET /skills
Get all skills organized by category.

**Response:**
```json
[
  {
    "id": 1,
    "name": "TypeScript",
    "category": "frontend",
    "proficiency": 5,
    "icon": "devicon-typescript-plain"
  }
]
```

### GET /experience
Get work experience history.

**Response:**
```json
[
  {
    "id": 1,
    "company": "Tech Corp",
    "position": "Senior Developer",
    "description": "Led development of...",
    "startDate": "2022-01-01",
    "endDate": null,
    "current": true,
    "technologies": "[\"React\", \"Node.js\"]"
  }
]
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Development

- **Local Development**: `npm run dev`
- **Deploy to Production**: `npm run deploy`
- **Build**: `npm run build`

## Database Schema

The `Projects` table includes:
- `id`: Primary key
- `name`: Project name
- `description`: Project description
- `technologies`: JSON array of technologies used
- `github_url`: GitHub repository URL
- `live_url`: Live demo URL
- `image_url`: Project image URL
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp 