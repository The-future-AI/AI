ALTER TABLE `topics` ADD `entities` json;--> statement-breakpoint
ALTER TABLE `topics` ADD `isElection` boolean DEFAULT false NOT NULL;