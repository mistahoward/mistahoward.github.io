CREATE TABLE `BlogPostTags` (
	`blog_post_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`blog_post_id`, `tag_id`),
	FOREIGN KEY (`blog_post_id`) REFERENCES `BlogPosts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `Tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Tags_name_unique` ON `Tags` (`name`);