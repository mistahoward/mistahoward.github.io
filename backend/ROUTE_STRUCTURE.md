# Backend Route Structure

This document outlines the modular route structure for the portfolio backend API.

## Overview

The backend has been refactored from a monolithic `index.ts` file into a modular structure with separate route files and middleware. This improves maintainability, readability, and makes it easier to add new features.

## File Structure

```
backend/src/
├── index.ts              # Main entry point and router mounting
├── schema.ts             # Database schema definitions
├── middleware/
│   └── auth.ts           # Authentication and response helpers
└── routes/
    ├── public.ts         # Public API endpoints
    └── admin.ts          # Admin-only endpoints
```

## Route Organization

### Main Router (`index.ts`)
- **Purpose**: Entry point that mounts all route modules
- **Responsibilities**:
  - Mount public routes under `/api/*`
  - Mount admin routes under `/api/admin/*`
  - Handle CORS preflight requests
  - Provide 404 fallback

### Public Routes (`routes/public.ts`)
- **Purpose**: Handle all public-facing API endpoints
- **Endpoints**:
  - `GET /api/projects` - Get all projects
  - `GET /api/blog` - Get published blog posts
  - `GET /api/blog/:slug` - Get specific blog post
  - `GET /api/skills` - Get all skills
  - `GET /api/experience` - Get work experience
  - `GET /api/health` - Health check

### Admin Routes (`routes/admin.ts`)
- **Purpose**: Handle all admin-only endpoints with authentication
- **Endpoints**:
  - `POST /api/admin/auth` - Admin authentication
  - `GET /api/admin/blog` - Get all blog posts (including drafts)
  - `POST /api/admin/blog` - Create blog post
  - `PUT /api/admin/blog/:id` - Update blog post
  - `DELETE /api/admin/blog/:id` - Delete blog post
  - `GET /api/admin/pets` - Get all pets
  - `POST /api/admin/pets` - Create pet
  - `PUT /api/admin/pets/:id` - Update pet
  - `DELETE /api/admin/pets/:id` - Delete pet

### Middleware (`middleware/auth.ts`)
- **Purpose**: Shared authentication and response utilities
- **Functions**:
  - `requireAdmin()` - Admin authentication middleware
  - `getCorsHeaders(env)` - Dynamic CORS headers based on environment
  - `errorResponse()` - Standardized error responses
  - `successResponse()` - Standardized success responses

## Benefits of This Structure

### 1. **Separation of Concerns**
- Public and admin functionality are clearly separated
- Each route file has a single responsibility
- Middleware is reusable across different route modules

### 2. **Maintainability**
- Easier to find and modify specific endpoints
- Reduced cognitive load when working on specific features
- Clear boundaries between different types of functionality

### 3. **Scalability**
- Easy to add new route modules (e.g., `routes/analytics.ts`)
- Simple to extend existing modules with new endpoints
- Middleware can be easily shared and extended

### 4. **Testing**
- Each route module can be tested independently
- Middleware functions can be unit tested
- Clear interfaces make mocking easier

### 5. **Code Reuse**
- Common response patterns are standardized
- Authentication logic is centralized
- CORS handling is consistent

## Adding New Routes

### 1. Create a New Route Module
```typescript
// routes/analytics.ts
import { Router } from 'itty-router';
import { successResponse, errorResponse } from '../middleware/auth';

const router = Router();

router.get('/stats', async (request: Request, env: Env) => {
  try {
    // Your logic here
    return successResponse(data);
  } catch (error) {
    return errorResponse('Failed to fetch stats');
  }
});

export default router;
```

### 2. Mount the Route in `index.ts`
```typescript
import analyticsRoutes from './routes/analytics';

// Mount analytics routes
router.all('/api/analytics/*', analyticsRoutes.handle);
```

### 3. Add Authentication (if needed)
```typescript
import { requireAdmin } from '../middleware/auth';

router.get('/admin-stats', async (request: Request, env: Env) => {
  const authCheck = requireAdmin(request, env);
  if (authCheck) return authCheck;
  
  // Your protected logic here
});
```

## Best Practices

### 1. **Consistent Response Format**
Always use the helper functions from middleware:
```typescript
// ✅ Good
return successResponse(data, 201, env);
return errorResponse('Not found', 404, env);

// ❌ Avoid
return new Response(JSON.stringify(data), { headers: {...} });
```

### 2. **Type Safety**
Use TypeScript interfaces for request bodies:
```typescript
const body = await request.json() as {
  title: string;
  content: string;
  published?: boolean;
};
```

### 3. **Error Handling**
Always wrap database operations in try-catch blocks:
```typescript
try {
  const result = await db.select().from(table);
  return successResponse(result, 200, env);
} catch (error) {
  return errorResponse('Database operation failed', 500, env);
}
```

### 4. **Authentication**
Use the `requireAdmin` middleware for all admin endpoints:
```typescript
const authCheck = requireAdmin(request, env);
if (authCheck) return authCheck;
```

## Migration Notes

If you're migrating from the old monolithic structure:

1. **No breaking changes** - All existing endpoints work the same way
2. **Same response format** - All responses use the same structure
3. **Same authentication** - Admin authentication works identically
4. **Better organization** - Code is now easier to navigate and maintain

## Environment Variables

The following environment variables need to be configured:

### In `.env` file (for development):
- `ADMIN_SECRET`: Secure password for admin authentication
- `CORS_ORIGIN`: Allowed origin for CORS requests (e.g., "http://localhost:5173")

### In Cloudflare Dashboard (for production):
- `ADMIN_SECRET`: Secure password for admin authentication (set via Cloudflare Dashboard)

**Important**: The `.env` file is automatically ignored by git and should never be committed. Use Cloudflare's environment variable system for production secrets.

## Future Enhancements

Potential improvements for this structure:

1. **Route-specific middleware** - Add middleware specific to certain route groups
2. **Validation middleware** - Add request validation helpers
3. **Rate limiting** - Add rate limiting middleware
4. **Logging** - Add request/response logging
5. **Caching** - Add response caching middleware
6. **API versioning** - Add versioning support for API endpoints 