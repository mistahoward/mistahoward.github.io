-- Add 'status' column to Testimonials
ALTER TABLE "Testimonials" ADD COLUMN "status" text NOT NULL DEFAULT 'needs_review';

-- SQLite does not support DROP COLUMN directly, so to remove 'approved',
-- you must recreate the table. Here is the safe pattern:

-- 1. Create new table without 'approved'
CREATE TABLE "_Testimonials_new" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "client_name" text NOT NULL,
    "client_title" text,
    "client_company" text,
    "content" text NOT NULL,
    "rating" integer,
    "relationship" text NOT NULL,
    "status" text NOT NULL DEFAULT 'needs_review',
    "created_at" text DEFAULT CURRENT_TIMESTAMP
);

-- 2. Copy data (map approved=true to status='approved', false to 'needs_review')
INSERT INTO "_Testimonials_new" (id, client_name, client_title, client_company, content, rating, relationship, status, created_at)
SELECT id, client_name, client_title, client_company, content, rating, relationship,
    CASE WHEN approved = 1 THEN 'approved' ELSE 'needs_review' END as status,
    created_at
FROM "Testimonials";

-- 3. Drop old table
DROP TABLE "Testimonials";

-- 4. Rename new table
ALTER TABLE "_Testimonials_new" RENAME TO "Testimonials";