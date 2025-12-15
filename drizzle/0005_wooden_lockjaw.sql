CREATE TABLE `brands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`website` varchar(255),
	`description` text,
	`industry` varchar(100),
	`logoUrl` varchar(500),
	`primaryColor` varchar(20),
	`secondaryColor` varchar(20),
	`accentColor` varchar(20),
	`tagline` varchar(255),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `brands_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `posts` ADD `brandId` int;