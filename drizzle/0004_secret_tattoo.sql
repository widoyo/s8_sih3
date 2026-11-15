CREATE TABLE `peringatan_dini` (
	`id` text PRIMARY KEY NOT NULL,
	`waktu_peringatan` text NOT NULL,
	`teks` text NOT NULL,
	`status` text DEFAULT 'AKTIF' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
