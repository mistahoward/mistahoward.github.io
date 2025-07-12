CREATE TABLE `BlogPosts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`published` integer DEFAULT false,
	`published_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `Experience` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company` text NOT NULL,
	`position` text NOT NULL,
	`description` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`current` integer DEFAULT false,
	`technologies` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `Pets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`species` text NOT NULL,
	`breed` text,
	`age` integer,
	`weight` integer,
	`color` text,
	`personality` text,
	`special_abilities` text,
	`favorite_food` text,
	`favorite_toy` text,
	`rescue_story` text,
	`image_url` text,
	`stats` text,
	`nickname` text,
	`adopted_date` text,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `Projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`project_type` text DEFAULT 'personal' NOT NULL,
	`technologies` text,
	`github_url` text NOT NULL,
	`live_url` text,
	`image_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `Skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`proficiency` integer NOT NULL,
	`icon` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `Testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_name` text NOT NULL,
	`client_title` text,
	`client_company` text,
	`content` text NOT NULL,
	`rating` integer,
	`project_id` integer,
	`approved` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`project_id`) REFERENCES `Projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `BlogPosts_slug_unique` ON `BlogPosts` (`slug`);