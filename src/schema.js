import { mysqlTable, varchar, int, text, timestamp, mysqlEnum, datetime } from "drizzle-orm/mysql-core"

// Master Data
export const categories = mysqlTable("categories", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
})

export const products = mysqlTable("products", {
    id: varchar("id", { length: 255 }).primaryKey(),
    sku: varchar("sku", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    categoryID: varchar("category_id", { length: 255 }).references(() => categories.id).notNull(),
    unit: varchar("unit", { length: 255 }).notNull(),
    description: text("description"),
    minStock: int("min_stock").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
})

export const users = mysqlTable("users", {
    id: varchar("id", { length: 255 }).primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    role: mysqlEnum(['admin', 'guest']).notNull(),
    lastLoginAt: timestamp("last_login_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
})

export const warehouses = mysqlTable("warehouses", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
})

// Stock Data
export const stockLevels = mysqlTable("stock_levels", {
    id: varchar("id", { length: 255 }).primaryKey(),
    productID: varchar("product_id", { length: 255 }).references(() => products.id).notNull(),
    warehouseID: varchar("warehouse_id", { length: 255 }).references(() => warehouses.id).notNull(),
    quantity: int("quantity").notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
})

export const stockIn = mysqlTable("stock_in", {
    id: varchar("id", { length: 255 }).primaryKey(),
    date: datetime("date").notNull(),
    productID: varchar("product_id", { length: 255 }).references(() => products.id).notNull(),
    warehouseID: varchar("warehouse_id", { length: 255 }).references(() => warehouses.id).notNull(),
    quantity: int("quantity").notNull(),
    sourceType: mysqlEnum("source_type", ['supplier', 'warehouse', 'return', 'adjustment']),
    sourceDetail: varchar("source_detail", { length: 255 }),
    refrenceCode: varchar("refrence_code", { length: 255 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
})

export const stockOut = mysqlTable("stock_out", {
    id: varchar("id", { length: 255 }).primaryKey(),
    date: datetime("date").notNull(),
    productID: varchar("product_id", { length: 255 }).references(() => products.id).notNull(),
    warehouseID: varchar("warehouse_id", { length: 255 }).references(() => warehouses.id).notNull(),
    quantity: int("quantity").notNull(),
    destinationType: mysqlEnum("destination_type", ['customer', 'warehouse', 'scrap', 'adjustment']),
    destinationDetail: varchar("destination_detail", { length: 255 }),
    refrenceCode: varchar("refrence_code", { length: 255 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
})

export const stockTransfers = mysqlTable("stock_transfers", {
    id: varchar("id", { length: 255 }).primaryKey(),
    date: datetime("date").notNull(),
    productID: varchar("product_id", { length: 255 }).references(() => products.id).notNull(),
    fromWarehouseID: varchar("from_warehouse_id", { length: 255 }).references(() => warehouses.id).notNull(),
    toWarehouseID: varchar("to_warehouse_id", { length: 255 }).references(() => warehouses.id).notNull(),
    quantity: int("quantity").notNull(),
    refrenceCode: varchar("refrence_code", { length: 255 }).notNull(),
    status: mysqlEnum("status", ['pending', 'completed', 'cancelled']).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
})