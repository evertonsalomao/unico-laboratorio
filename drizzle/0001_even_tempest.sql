CREATE TABLE `os_launches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store` varchar(80) NOT NULL,
	`osNumber` varchar(40) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int NOT NULL,
	CONSTRAINT `os_launches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(20) NOT NULL DEFAULT 'user';