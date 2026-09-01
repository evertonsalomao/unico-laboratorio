CREATE TABLE `breaks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit` varchar(80) NOT NULL,
	`osNumber` varchar(40) NOT NULL,
	`report` varchar(1000) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int NOT NULL,
	CONSTRAINT `breaks_id` PRIMARY KEY(`id`)
);
