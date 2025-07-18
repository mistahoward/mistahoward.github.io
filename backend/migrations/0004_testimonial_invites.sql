CREATE TABLE `TestimonialInvites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`email` text,
	`name` text,
	`used` integer DEFAULT false,
	`used_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`expires_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `TestimonialInvites_token_unique` ON `TestimonialInvites` (`token`);