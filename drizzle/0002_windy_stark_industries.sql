ALTER TABLE `media_outlets` ADD `factuality` enum('muito-alta','alta','mista','baixa') DEFAULT 'alta' NOT NULL;--> statement-breakpoint
ALTER TABLE `media_outlets` ADD `ownership` varchar(256);--> statement-breakpoint
ALTER TABLE `media_outlets` ADD `foundedYear` int;--> statement-breakpoint
ALTER TABLE `media_outlets` ADD `description` text;