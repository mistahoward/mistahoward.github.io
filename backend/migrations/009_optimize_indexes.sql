-- Add performance indexes to existing tables
CREATE INDEX `comments_blog_slug_idx` ON `Comments` (`blog_slug`);
--> statement-breakpoint
CREATE INDEX `comments_user_id_idx` ON `Comments` (`user_id`);
--> statement-breakpoint
CREATE INDEX `comments_parent_id_idx` ON `Comments` (`parent_id`);
--> statement-breakpoint
CREATE INDEX `comments_created_at_idx` ON `Comments` (`created_at`);
--> statement-breakpoint
CREATE INDEX `comments_is_deleted_idx` ON `Comments` (`is_deleted`);
--> statement-breakpoint
CREATE INDEX `users_github_username_idx` ON `Users` (`github_username`);
--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `Users` (`role`);
--> statement-breakpoint
CREATE INDEX `votes_comment_id_idx` ON `Votes` (`comment_id`);
--> statement-breakpoint
CREATE INDEX `votes_user_id_idx` ON `Votes` (`user_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `votes_comment_user_unique` ON `Votes` (`comment_id`,`user_id`);