import { z } from "zod"

export const categoryValidator = z.object({
    name: z
        .string()
        .nonempty("Name is required")
        .max(255, "Name must be at most 255 characters"),
    description: z
        .string()
        .nullable()
        .optional(),
})

export const productValidator = z.object({
    sku: z
        .string()
        .max(255, "Sku must be at most 255 characters")
        .nullable()
        .optional(),
    name: z
        .string()
        .nonempty("Name is required")
        .max(255, "Name must be at most 255 characters"),
    categoryID: z
        .string()
        .nonempty("Category is required"),
    unit: z
        .string()
        .nonempty("Unit is required"),
    description: z
        .string()
        .nullable()
        .optional(),
    minStock: z
        .number()
        .min(0, "Minimum stock must be 0 or greater"),
})

export const userValidator = z.object({
    username: z
        .string()
        .max(255, "Name must be at most 255 characters")
        .nonempty("Username is required"),
    password: z
        .string()
        .max(255, "Password must be at most 255 characters")
        .nonempty("Password is required")
})

export const warehouseValidator = z.object({
    name: z
        .string()
        .nonempty("Name is required")
        .max(255, "Name must be at most 255 characters"),
    location: z
        .string()
        .max(255, "Location must be at most 255 characters")
        .nonempty("Location is required"),
})

export const stockLevelValidator = z.object({
    productID: z
        .string()
        .nonempty("Product is required"),
    warehouseID: z
        .string()
        .nonempty("Warehouse is required"),
    quantity: z
        .number()
        .min(0, "Minimum stock must be 0 or greater"),
})

export const stockInValidator = z.object({
    date: z.iso
        .datetime("Date is required"),
    productID: z
        .string()
        .nonempty("Product is required"),
    warehouseID: z
        .string()
        .nonempty("Warehouse is required"),
    quantity: z
        .number()
        .min(1, "Minimum stock must be 1 or greater"),
    sourceType: z
        .enum(["supplier", "warehouse", "return", "adjustment"])
        .nullable()
        .optional(),
    sourceDetail: z
        .string()
        .nullable()
        .optional(),
    refrenceCode: z
        .string()
        .max(255, "Refrence code must be at most 255 characters")
        .nonempty("Refrence Code is required"),
    notes: z
        .string()
        .nullable()
        .optional()
})

export const stockOutValidator = z.object({
    date: z.iso
        .datetime("Date is required"),
    productID: z
        .string()
        .nonempty("Product is required"),
    warehouseID: z
        .string()
        .nonempty("Warehouse is required"),
    quantity: z
        .number()
        .min(1, "Minimum stock must be 1 or greater"),
    destinationType: z
        .enum(["supplier", "warehouse", "return", "adjustment"])
        .nullable()
        .optional(),
    destinationDetail: z
        .string()
        .nullable()
        .optional(),
    refrenceCode: z
        .string()
        .max(255, "Refrence code must be at most 255 characters")
        .nonempty("Refrence Code is required"),
    notes: z
        .string()
        .nullable()
        .optional()
})

export const stockTransferValidator = z.object({
    date: z.iso
        .datetime("Date is required"),
    productID: z
        .string()
        .nonempty("Product is required"),
    fromWarehouseID: z
        .string()
        .nonempty("Warehouse is required"),
    toWarehouseID: z
        .string()
        .nonempty("Warehouse is required"),
    quantity: z
        .number()
        .min(1, "Minimum stock must be 1 or greater"),
    refrenceCode: z
        .string()
        .max(255, "Refrence code must be at most 255 characters")
        .nonempty("Refrence Code is required"),
    status: z
        .enum(["pending", "completed", "cancelled"])
})