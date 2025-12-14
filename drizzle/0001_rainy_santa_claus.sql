CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`url` text NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`width` int,
	`height` int,
	`category` varchar(50),
	`assetType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platforms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`color` varchar(20),
	`icon` varchar(50),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platforms_id` PRIMARY KEY(`id`),
	CONSTRAINT `platforms_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `postAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`assetId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `postAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platformId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`status` enum('draft','scheduled','published','archived') NOT NULL DEFAULT 'draft',
	`postType` varchar(50),
	`scheduledFor` timestamp,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
