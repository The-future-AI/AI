ALTER TABLE `media_outlets` ADD `category` enum('mainstream','regional','publica','independente','checagem','internacional') DEFAULT 'mainstream' NOT NULL;--> statement-breakpoint
ALTER TABLE `media_outlets` ADD `region` varchar(64) DEFAULT 'Nacional' NOT NULL;--> statement-breakpoint
ALTER TABLE `media_outlets` ADD `language` varchar(16) DEFAULT 'pt-BR' NOT NULL;--> statement-breakpoint
ALTER TABLE `media_outlets` ADD `paywall` enum('livre','parcial','assinatura') DEFAULT 'livre' NOT NULL;