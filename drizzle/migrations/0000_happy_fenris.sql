CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`type` text NOT NULL,
	`expires_at` integer,
	`alert_days_before` integer DEFAULT 30,
	`file_url` text
);
--> statement-breakpoint
CREATE TABLE `fuel_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`date` integer,
	`liters` real NOT NULL,
	`price_per_liter` real NOT NULL,
	`total` real NOT NULL,
	`km` integer
);
--> statement-breakpoint
CREATE TABLE `maintenances` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`date` integer,
	`km` integer,
	`cost` real
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plate` text NOT NULL,
	`vin` text,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`year` integer,
	`color` text,
	`fuel_type` text,
	`km` integer DEFAULT 0,
	`status` text DEFAULT 'active',
	`created_at` integer
);
