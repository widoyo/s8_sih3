PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pos_hidrologi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text,
	`nama` text NOT NULL,
	`tipe` text NOT NULL,
	`das_id` integer,
	`sungai` text,
	`desa` text,
	`kecamatan` text,
	`kabupaten` text,
	`provinsi` text,
	`latitude` real,
	`longitude` real,
	`elevasi` real,
	`alert_status` text DEFAULT 'NORMAL',
	`last_value` real,
	`unit` text DEFAULT 'm',
	`lembaga_id` integer,
	`is_show` integer DEFAULT 1,
	`last_updated` text,
	FOREIGN KEY (`das_id`) REFERENCES `das`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lembaga_id`) REFERENCES `lembagas`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_pos_hidrologi`("id", "code", "nama", "tipe", "das_id", "sungai", "desa", "kecamatan", "kabupaten", "provinsi", "latitude", "longitude", "elevasi", "alert_status", "last_value", "unit", "lembaga_id", "is_show", "last_updated") SELECT "id", "code", "nama", "tipe", "das_id", "sungai", "desa", "kecamatan", "kabupaten", "provinsi", "latitude", "longitude", "elevasi", "alert_status", "last_value", "unit", "lembaga_id", "is_show", "last_updated" FROM `pos_hidrologi`;--> statement-breakpoint
DROP TABLE `pos_hidrologi`;--> statement-breakpoint
ALTER TABLE `__new_pos_hidrologi` RENAME TO `pos_hidrologi`;--> statement-breakpoint
PRAGMA foreign_keys=ON;