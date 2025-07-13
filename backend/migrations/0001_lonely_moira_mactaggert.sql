CREATE TABLE `Certifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`issuer` text NOT NULL,
	`issue_date` text NOT NULL,
	`expiry_date` text,
	`credential_id` text,
	`credential_url` text,
	`description` text,
	`category` text,
	`image_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
