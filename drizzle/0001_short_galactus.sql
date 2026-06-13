CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topicId` int,
	`outletId` int NOT NULL,
	`title` varchar(1024) NOT NULL,
	`summary` text,
	`url` varchar(2048) NOT NULL,
	`imageUrl` varchar(2048),
	`spectrum` enum('esquerda','centro-esquerda','centro','centro-direita','direita'),
	`category` enum('politica','economia','internacional','esporte','tecnologia','geral') DEFAULT 'geral',
	`spectrumConfidence` float DEFAULT 0,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`scrapedAt` timestamp NOT NULL DEFAULT (now()),
	`processed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_url_unique` UNIQUE(`url`)
);
--> statement-breakpoint
CREATE TABLE `media_outlets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(64) NOT NULL,
	`url` varchar(512) NOT NULL,
	`logoUrl` varchar(512),
	`spectrum` enum('esquerda','centro-esquerda','centro','centro-direita','direita') NOT NULL,
	`country` varchar(8) NOT NULL DEFAULT 'BR',
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_outlets_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_outlets_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `scrape_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('running','completed','failed') NOT NULL DEFAULT 'running',
	`articlesScraped` int NOT NULL DEFAULT 0,
	`articlesProcessed` int NOT NULL DEFAULT 0,
	`topicsCreated` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `scrape_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`summary` text,
	`category` enum('politica','economia','internacional','esporte','tecnologia','geral') NOT NULL DEFAULT 'geral',
	`imageUrl` varchar(1024),
	`totalSources` int NOT NULL DEFAULT 0,
	`leftCount` int NOT NULL DEFAULT 0,
	`centerLeftCount` int NOT NULL DEFAULT 0,
	`centerCount` int NOT NULL DEFAULT 0,
	`centerRightCount` int NOT NULL DEFAULT 0,
	`rightCount` int NOT NULL DEFAULT 0,
	`leftPct` float NOT NULL DEFAULT 0,
	`centerLeftPct` float NOT NULL DEFAULT 0,
	`centerPct` float NOT NULL DEFAULT 0,
	`centerRightPct` float NOT NULL DEFAULT 0,
	`rightPct` float NOT NULL DEFAULT 0,
	`isBlindspot` boolean NOT NULL DEFAULT false,
	`blindspotSpectrum` varchar(32),
	`trending` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `topics_id` PRIMARY KEY(`id`)
);
