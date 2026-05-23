ALTER TABLE `vehicles` ADD `next_itv_date` integer;--> statement-breakpoint
ALTER TABLE `vehicles` ADD `insurance_expiry` integer;--> statement-breakpoint
ALTER TABLE `vehicles` ADD `oil_change_reminder` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `vehicles` ADD `next_revision_km` integer DEFAULT 15000;--> statement-breakpoint
ALTER TABLE `vehicles` ADD `revision_interval_km` integer DEFAULT 15000;