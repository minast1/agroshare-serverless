CREATE TABLE `farmers` (
	`id` text PRIMARY KEY,
	`full_name` text NOT NULL,
	`phone_number` text NOT NULL UNIQUE,
	`location_hub` text NOT NULL,
	`farm_size_acres` real NOT NULL,
	`crop_variety` text NOT NULL,
	`created_at` integer DEFAULT 1791329926
);
