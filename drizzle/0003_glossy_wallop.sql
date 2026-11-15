ALTER TABLE `pos_hidrologi` ADD `atab_station_id` integer;--> statement-breakpoint
ALTER TABLE `pos_hidrologi` ADD `flow_direction_degrees` real;--> statement-breakpoint
CREATE UNIQUE INDEX `pos_hidrologi_atab_station_id_unique` ON `pos_hidrologi` (`atab_station_id`);