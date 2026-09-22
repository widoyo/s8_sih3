CREATE TABLE `bmkg_warnings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`region` text NOT NULL,
	`severity` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`issued_at` text NOT NULL,
	`expires_at` text
);
--> statement-breakpoint
CREATE TABLE `das` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama` text NOT NULL,
	`kode` text,
	`luas_km2` integer,
	`geometry` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `das_kode_unique` ON `das` (`kode`);--> statement-breakpoint
CREATE TABLE `hidrologi_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pos_id` text NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`status` text DEFAULT 'NORMAL',
	`recorded_at` text NOT NULL,
	FOREIGN KEY (`pos_id`) REFERENCES `pos_hidrologi`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lembagas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama` text NOT NULL,
	`alamat` text,
	`desa_kelurahan` text,
	`kecamatan` text,
	`kabupaten_kota` text,
	`telp` text,
	`pic_sih3` text,
	`pic_telp` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pos_hidrologi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text,
	`nama` text NOT NULL,
	`tipe` text NOT NULL,
	`das_id` text,
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
CREATE TABLE `scraper_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`status` text NOT NULL,
	`items_scraped` integer DEFAULT 0,
	`error_message` text,
	`executed_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`details` text,
	`ip_address` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text,
	`role` text DEFAULT 'TENANT_ADMIN' NOT NULL,
	`lembaga_id` integer,
	`last_login` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`lembaga_id`) REFERENCES `lembagas`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);