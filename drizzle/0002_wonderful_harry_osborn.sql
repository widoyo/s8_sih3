PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_scraper_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`status` text NOT NULL,
	`items_scraped` integer DEFAULT 0,
	`error_message` text,
	`executed_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_scraper_logs`("id", "source", "status", "items_scraped", "error_message", "executed_at") SELECT "id", "source", "status", "items_scraped", "error_message", "executed_at" FROM `scraper_logs`;--> statement-breakpoint
DROP TABLE `scraper_logs`;--> statement-breakpoint
ALTER TABLE `__new_scraper_logs` RENAME TO `scraper_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;