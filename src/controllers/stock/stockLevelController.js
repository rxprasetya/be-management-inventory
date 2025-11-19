import db from "../../config/db.js"
import { warehouses, stockLevels, products } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../utils/helper.js"
import { eq } from "drizzle-orm"
import { v4 as UUID } from "uuid"
import { stockLevelValidator } from "../../validators/index.js"

export const getStockLevels = async (req, res) => {
    try {
        const stockLevel = await db
            .select({
                id: stockLevels.id,
                productName: products.name,
                warehouseName: warehouses.name,
                quantity: stockLevels.quantity,
            })
            .from(stockLevels)
            .innerJoin(products, eq(stockLevels.productID, products.id))
            .innerJoin(warehouses, eq(stockLevels.warehouseID, warehouses.id))

        return msgSuccess(res, 200, `Stocks retrieved successfully`, stockLevel)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getStockLevelById = async (req, res, id) => {
    try {
        const stockLevel = await db
            .select({
                id: stockLevels.id,
                productID: products.id,
                productName: products.name,
                warehouseID: warehouses.id,
                warehouseName: warehouses.name,
                quantity: stockLevels.quantity,
            })
            .from(stockLevels)
            .innerJoin(products, eq(stockLevels.productID, products.id))
            .innerJoin(warehouses, eq(stockLevels.warehouseID, warehouses.id))
            .where(eq(stockLevels.id, id))

        if (stockLevel.length === 0) return msgError(res, 404, `Stock not found`)

        return msgSuccess(res, 200, `Stock details retrieved successfully`, stockLevel)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const createStockLevel = async (req, res) => {
    try {
        const body = await parseBody(req)
        const validation = stockLevelValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { productID, warehouseID, quantity } = validation.data

        const newStockLevel = {
            id: UUID(),
            productID,
            warehouseID,
            quantity: Number(quantity),
        }

        await db.insert(stockLevels).values(newStockLevel)
        return msgSuccess(res, 201, `Stock created successfully`, newStockLevel)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const updateStockLevel = async (req, res, id) => {
    try {
        const stockLevel = await db
            .select({ id: stockLevels.id })
            .from(stockLevels)
            .where(eq(stockLevels.id, id))
            .limit(1)

        if (stockLevel.length === 0) return msgError(res, 404, "Stock not found")
            
        const body = await parseBody(req)
        const validation = stockLevelValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { productID, warehouseID, quantity } = validation.data

        const updateStockLevel = {
            productID,
            warehouseID,
            quantity: Number(quantity),
        }

        await db.update(stockLevels).set(updateStockLevel).where(eq(stockLevels.id, id))
        return msgSuccess(res, 200, `Stock updated successfully`, { id, ...updateStockLevel })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const deleteStockLevel = async (req, res, id) => {
    try {
        const stockLevel = await db
            .select({ id: stockLevels.id })
            .from(stockLevels)
            .where(eq(stockLevels.id, id))
            .limit(1)

        if (stockLevel.length === 0) return msgError(res, 404, "Stock not found")

        await db.delete(stockLevels).where(eq(stockLevels.id, id))
        return msgSuccess(res, 200, `Stock deleted successfully`, { id })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}