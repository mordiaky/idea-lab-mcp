CREATE TABLE `critiques` (
	`id` text PRIMARY KEY NOT NULL,
	`idea_id` text NOT NULL,
	`content` text NOT NULL,
	`wrapper_problem` text,
	`existing_products` text,
	`fragile_dependencies` text,
	`vague_statement` text,
	`violates_software_only` text,
	`overall_verdict` text,
	`verdict_reasoning` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `idea_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`domain` text,
	`candidate_count` integer NOT NULL,
	`pass_count` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `idea_tags` (
	`idea_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`idea_id`, `tag_id`),
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `idea_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`idea_id` text NOT NULL,
	`mutation_axis` text,
	`mutation_depth` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`one_liner` text NOT NULL,
	`problem` text NOT NULL,
	`solution` text NOT NULL,
	`why_now` text,
	`target_user` text,
	`constraints` text,
	`risks` text,
	`mvp_steps` text,
	`domain` text,
	`status` text DEFAULT 'raw' NOT NULL,
	`re_validated_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rejection_patterns` (
	`id` text PRIMARY KEY NOT NULL,
	`pattern_text` text NOT NULL,
	`source_critique_id` text,
	`frequency_count` integer DEFAULT 1 NOT NULL,
	`last_seen` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`source_critique_id`) REFERENCES `critiques`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rejection_patterns_pattern_text_unique` ON `rejection_patterns` (`pattern_text`);--> statement-breakpoint
CREATE TABLE `scores` (
	`id` text PRIMARY KEY NOT NULL,
	`idea_id` text NOT NULL,
	`novelty` real NOT NULL,
	`usefulness` real NOT NULL,
	`feasibility` real NOT NULL,
	`testability` real NOT NULL,
	`speed_to_mvp` real NOT NULL,
	`defensibility` real NOT NULL,
	`clarity` real NOT NULL,
	`composite` real NOT NULL,
	`novelty_reasoning` text,
	`usefulness_reasoning` text,
	`feasibility_reasoning` text,
	`testability_reasoning` text,
	`speed_to_mvp_reasoning` text,
	`defensibility_reasoning` text,
	`clarity_reasoning` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);