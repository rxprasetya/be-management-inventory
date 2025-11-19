CREATE TABLE `stock_in` (
	`id` varchar(255) NOT NULL,
	`date` datetime NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`source_type` enum('supplier','warehouse','return','adjustment'),
	`source_detail` varchar(255),
	`refrence_code` varchar(255) NOT NULL,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stock_in_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_levels` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stock_levels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_out` (
	`id` varchar(255) NOT NULL,
	`date` datetime NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`destination_type` enum('customer','warehouse','scrap','adjustment'),
	`destination_detail` varchar(255),
	`refrence_code` varchar(255) NOT NULL,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stock_out_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_transfers` (
	`id` varchar(255) NOT NULL,
	`date` datetime NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`from_warehouse_id` varchar(255) NOT NULL,
	`to_warehouse_id` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`refrence_code` varchar(255) NOT NULL,
	`status` enum('pending','completed','cancelled') NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stock_transfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `sku` varchar(255);--> statement-breakpoint
ALTER TABLE `stock_in` ADD CONSTRAINT `stock_in_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_in` ADD CONSTRAINT `stock_in_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_levels` ADD CONSTRAINT `stock_levels_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_levels` ADD CONSTRAINT `stock_levels_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_out` ADD CONSTRAINT `stock_out_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_out` ADD CONSTRAINT `stock_out_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_transfers` ADD CONSTRAINT `stock_transfers_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_transfers` ADD CONSTRAINT `stock_transfers_from_warehouse_id_warehouses_id_fk` FOREIGN KEY (`from_warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_transfers` ADD CONSTRAINT `stock_transfers_to_warehouse_id_warehouses_id_fk` FOREIGN KEY (`to_warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;