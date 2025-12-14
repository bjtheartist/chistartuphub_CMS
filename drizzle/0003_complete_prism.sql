CREATE TABLE `intelligence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`source` varchar(100),
	`url` varchar(500),
	`tags` text,
	`convertedToPostId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `intelligence_id` PRIMARY KEY(`id`)
);
