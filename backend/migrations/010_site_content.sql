-- Site copy edited in the admin panel, one Markdown block per key.
-- Seeded with the About Me text that used to be hard-coded in frontend/src/components/about/AboutStatic.tsx.
CREATE TABLE `SiteContent` (
	`key` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `SiteContent` (`key`, `content`) VALUES ('about', 'Most recently, I was a **Software Engineer III - Team Lead** at Compyl, after a run as its **Front End Subject Matter Expert**. That really just means I''m a full stack engineer who is also a perfectionist about the front end.

Full disclosure: I''m a *yak shaver.* It means I sometimes start on one task and find myself three layers deep fixing something else entirely, but it''s because I''m obsessed with not only delivering a great user experience, but also delivering a great developer experience along the way.
It''s a superpower and my kryptonite, and I''ve learned to embrace it. Did you peep the loading animation?

Away from the keyboard, I''m spending time with my family (read: wife and animals). Video games have taken a back seat lately, and I wouldn''t trade that time for anything. Well, that and programming. I genuinely love it. I''m always looking for the next challenge.');
