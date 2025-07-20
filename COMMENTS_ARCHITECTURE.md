# Blog Comments System Architecture

## Overview
This document outlines the architecture for implementing a comments system on blog posts using Firebase GitHub SSO for authentication and Cloudflare D1 for data storage.

## System Components

### 1. Authentication Layer
- **Provider**: Firebase Authentication with GitHub SSO
- **Purpose**: User identity verification and session management
- **Integration**: Frontend will use Firebase SDK for authentication
- **User Data**: Store minimal user info (uid, displayName, photoURL, githubUsername) in D1

### 2. Database Schema (Cloudflare D1)

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- Firebase UID
  display_name TEXT NOT NULL,    -- User's display name
  photo_url TEXT,               -- Profile picture URL
  github_username TEXT,         -- GitHub username
  role TEXT DEFAULT 'user',     -- 'admin', 'author', 'user'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Comments Table
```sql
CREATE TABLE comments (
  id TEXT PRIMARY KEY,           -- UUID
  blog_slug TEXT NOT NULL,       -- Reference to blog post
  user_id TEXT NOT NULL,         -- Reference to users table
  parent_id TEXT,               -- For nested replies (NULL for top-level)
  content TEXT NOT NULL,        -- Comment text (markdown supported)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES comments(id)
);
```

#### Votes Table
```sql
CREATE TABLE votes (
  id TEXT PRIMARY KEY,           -- UUID
  comment_id TEXT NOT NULL,      -- Reference to comments table
  user_id TEXT NOT NULL,         -- Reference to users table
  vote_type INTEGER NOT NULL,    -- 1 for upvote, -1 for downvote
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(comment_id, user_id)    -- One vote per user per comment
);
```

### 3. API Endpoints

#### Authentication Endpoints
- `POST /api/auth/login` - Initiate GitHub SSO
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user info

#### Comment Endpoints
- `GET /api/comments/:blogSlug` - Get comments for a blog post
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Soft delete comment
- `POST /api/comments/:id/vote` - Vote on comment (upvote/downvote)
- `DELETE /api/comments/:id/vote` - Remove vote

#### Admin Comment Endpoints
- `GET /api/admin/comments` - Get all comments (with filtering/pagination)
- `DELETE /api/admin/comments/:id` - Admin delete comment
- `PUT /api/admin/comments/:id/status` - Update comment status (approved/flagged/deleted)
- `POST /api/admin/comments/bulk-action` - Bulk moderation actions
- `GET /api/admin/users/:id/comments` - Get all comments by user
- `PUT /api/admin/users/:id/ban` - Ban/unban user from commenting

### 4. Frontend Components

#### Authentication Components
- `AuthProvider` - Context provider for authentication state
- `LoginButton` - GitHub SSO login button
- `UserAvatar` - Display user avatar and name

#### Comment Components
- `CommentsSection` - Main container for comments
- `CommentForm` - Form to create/edit comments
- `CommentList` - List of comments with pagination
- `CommentItem` - Individual comment display
- `CommentActions` - Edit, delete, reply, vote buttons
- `ReplyForm` - Form for nested replies
- `UserBadge` - Display user role badges (Admin, Author, User)

#### Admin Comment Components
- `CommentManager` - Admin panel for comment moderation
- `CommentTable` - Data table with filtering and bulk actions
- `CommentModerationModal` - Modal for individual comment moderation
- `UserCommentHistory` - View all comments by a specific user
- `BulkActionToolbar` - Toolbar for bulk moderation actions

### 5. Data Flow

#### Comment Creation Flow
1. User authenticates via Firebase GitHub SSO
2. Frontend calls `POST /api/comments` with comment data
3. Backend validates user session and creates comment
4. Frontend updates comment list optimistically
5. Real-time update via WebSocket or polling

#### Voting Flow
1. User clicks vote button on comment
2. Frontend calls `POST /api/comments/:id/vote`
3. Backend updates vote in database
4. Frontend updates vote count and button state

### 6. Security Considerations

#### Authentication
- All comment operations require valid Firebase session
- JWT tokens validated on each request
- User can only edit/delete their own comments

#### Input Validation
- Comment content sanitized (XSS prevention)
- Markdown rendering with safe subset (whitelist allowed tags/elements)
- HTML sanitization for user-generated content
- Rate limiting on comment creation
- Content length limits and validation

#### Data Integrity
- Foreign key constraints in database
- Soft deletes for comments (preserve thread structure)
- Vote integrity (one vote per user per comment)

### 7. Performance Considerations

#### Database Optimization
- Indexes on frequently queried columns (blog_slug, user_id, created_at)
- Pagination for comment lists
- Efficient vote counting with aggregation queries

#### Frontend Optimization
- Virtual scrolling for large comment threads
- Optimistic updates for better UX
- Debounced comment submission
- Lazy loading of nested replies

### 8. User Experience Features

#### Comment Features
- Markdown support for rich text (with sanitization)
- HTML sanitization for safe rendering
- Nested replies (threaded comments)
- Edit/delete own comments
- Upvote/downvote system
- Comment sorting (newest, oldest, most voted)

#### Moderation Features
- Report inappropriate comments
- Admin moderation tools
  - View all comments across all blog posts
  - Delete/archive comments
  - Ban users from commenting
  - Bulk moderation actions
  - Comment approval workflow
- Spam detection
- Content filtering

### 9. Implementation Phases

#### Phase 1: Core Infrastructure
1. Database schema setup
2. Firebase authentication integration
3. Basic CRUD API endpoints
4. Simple comment display

#### Phase 2: Enhanced Features
1. Voting system
2. Nested replies
3. Markdown support
4. Edit/delete functionality
5. Admin moderation panel

#### Phase 3: Polish & Performance
1. Pagination and optimization
2. Real-time updates
3. Moderation tools
4. Advanced UX features
5. Mobile Responsiveness

### 10. Technical Stack

#### Backend
- Cloudflare Workers (existing)
- Cloudflare D1 (SQLite)
- Firebase Admin SDK for auth validation

#### Frontend
- Preact (existing)
- Firebase SDK for authentication
- Markdown parser for comment rendering
- HTML sanitization library (DOMPurify or similar)
- State management for comments

#### Development Tools
- Drizzle ORM for database operations
- TypeScript for type safety
- ESLint for code quality

## Next Steps
1. Review and approve this architecture
2. Set up database migrations
3. Implement authentication layer
4. Build core comment functionality
5. Add voting system
6. Polish user experience

## Questions for Discussion
- Should we implement real-time updates or use polling?
- What level of markdown support do we want?
- How deep should nested replies go?
- Should we implement comment moderation features?
- What rate limiting should we apply?
- Which HTML sanitization library should we use (DOMPurify, sanitize-html, etc.)?
- What markdown features should be allowed (links, images, code blocks, etc.)?
- What admin moderation features are most important for your use case?
- Should we implement comment approval workflow or allow immediate posting?
- How should we handle user bans and comment history? 