import db from "../../config/db.js"
import { warehouses, stockLevels, products, stockIn, stockOut } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../utils/helper.js"
import { and, desc, eq, ne } from "drizzle-orm"
import { v4 as UUID } from "uuid"
import { stockLevelValidator } from "../../validators/index.js"
import logger from "../../logger/index.js"

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
            .orderBy(desc(stockLevels.updatedAt))

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

        const existing = await db
            .select({
                id: stockLevels.id
            })
            .from(stockLevels)
            .where(
                and(
                    eq(stockLevels.productID, productID),
                    eq(stockLevels.warehouseID, warehouseID)
                )
            )
            .limit(1)

        if (existing.length > 0) return msgError(res, 409, "Duplicate stock.")

        const newStockLevel = {
            id: UUID(),
            productID,
            warehouseID,
            quantity: Math.max(0, Number(quantity)),
        }

        await db.insert(stockLevels).values(newStockLevel)

        logger.info({
            status: true,
            action: "CREATE_STOCK_LEVEL",
            data: newStockLevel
        })

        return msgSuccess(res, 201, `Stock created successfully`, newStockLevel)
    } catch (error) {

        logger.error({
            status: false,
            action: "CREATE_STOCK_LEVEL",
            message: error.message,
        })

        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const updateStockLevel = async (req, res, id) => {
    try {
        const stockLevel = await db
            .select({
                id: stockLevels.id,
                oldProductID: stockLevels.productID,
                oldWarehouseID: stockLevels.warehouseID,
                oldQuantity: stockLevels.quantity,
            })
            .from(stockLevels)
            .where(eq(stockLevels.id, id))
            .limit(1)

        if (stockLevel.length === 0) return msgError(res, 404, "Stock not found")

        const { oldProductID, oldWarehouseID, oldQuantity } = stockLevel[0]

        const body = await parseBody(req)
        const validation = stockLevelValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { productID, warehouseID, quantity } = validation.data

        const existing = await db
            .select({
                id: stockLevels.id
            })
            .from(stockLevels)
            .where(
                and(
                    ne(stockLevels.id, id),
                    eq(stockLevels.productID, productID),
                    eq(stockLevels.warehouseID, warehouseID)
                )
            )
            .limit(1)

        if (existing.length > 0) return msgError(res, 409, "Duplicate stock.")

        const updateStockLevel = {
            productID,
            warehouseID,
            quantity: Math.max(0, Number(quantity)),
        }

        await db.update(stockLevels).set(updateStockLevel).where(eq(stockLevels.id, id))

        logger.info({
            status: true,
            action: "UPDATE_STOCK_LEVEL",
            oldData: {
                id,
                oldProductID,
                oldWarehouseID,
                oldQuantity
            },
            newData: { id, ...updateStockLevel }
        })

        return msgSuccess(res, 200, `Stock updated successfully`, { id, ...updateStockLevel })
    } catch (error) {

        logger.error({
            status: false,
            action: "UPDATE_STOCK_LEVEL",
            message: error.message,
        })

        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const deleteStockLevel = async (req, res, id) => {
    try {
        const stockLevel = await db
            .select({
                id: stockLevels.id,
                productID: stockLevels.productID,
                warehouseID: stockLevels.warehouseID
            })
            .from(stockLevels)
            .where(eq(stockLevels.id, id))
            .limit(1)

        if (stockLevel.length === 0) return msgError(res, 404, "Stock not found")

        const { productID, warehouseID } = stockLevel[0]

        const relatedStockIn = await db
            .select({ id: stockIn.id })
            .from(stockIn)
            .where(
                and(
                    eq(stockIn.productID, productID),
                    eq(stockIn.warehouseID, warehouseID)
                )
            )
            .limit(1)

        if (relatedStockIn.length > 0) return msgError(res, 400, "Stock still in use by stock in.")

        const relatedStockOut = await db
            .select({ id: stockOut.id })
            .from(stockOut)
            .where(
                and(
                    eq(stockOut.productID, productID),
                    eq(stockOut.warehouseID, warehouseID),
                )
            )
            .limit(1)

        if (relatedStockOut.length > 0) return msgError(res, 400, "Stock still in use by stock out.")

        await db.delete(stockLevels).where(eq(stockLevels.id, id))

        logger.info({
            status: true,
            action: "DELETE_STOCK_LEVEL",
            id
        })

        return msgSuccess(res, 200, `Stock deleted successfully`, { id })
    } catch (error) {

        logger.error({
            status: false,
            action: "DELETE_STOCK_LEVEL",
            message: error.message,
        })

        return msgError(res, 500, `Internal Server Error`, error)
    }
}