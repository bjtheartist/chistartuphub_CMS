CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`specific` text,
	`measurable` text,
	`achievable` text,
	`relevant` text,
	`timeBound` text,
	`targetValue` int,
	`currentValue` int DEFAULT 0,
	`metricType` varchar(50),
	`status` enum('active','completed','paused','cancelled') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `postGoals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`goalId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `postGoals_id` PRIMARY KEY(`id`)
);
