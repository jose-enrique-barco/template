CREATE TABLE `counters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
