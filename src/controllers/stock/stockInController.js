import db from "../../config/db.js"
import { warehouses, stockIn, products, stockLevels } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../utils/helper.js"
import { and, desc, eq, ne, sql } from "drizzle-orm"
import { v4 as UUID } from "uuid"
import { stockInValidator } from "../../validators/index.js"
import logger from "../../logger/index.js"

export const getStockIn = async (req, res) => {
    try {
        const stock = await db
            .select({
                id: stockIn.id,
                date: stockIn.date,
                productName: products.name,
                warehouseName: warehouses.name,
                quantity: stockIn.quantity,
                refrenceCode: stockIn.refrenceCode,
            })
            .from(stockIn)
            .innerJoin(products, eq(stockIn.productID, products.id))
            .innerJoin(warehouses, eq(stockIn.warehouseID, warehouses.id))
            .orderBy(desc(stockIn.date))

        return msgSuccess(res, 200, `Stocks retrieved successfully`, stock)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getStockInById = async (req, res, id) => {
    try {
        const stock = await db
            .select({
                id: stockIn.id,
                date: stockIn.date,
                productID: products.id,
                productName: products.name,
                warehouseID: warehouses.id,
                warehouseName: warehouses.name,
                quantity: stockIn.quantity,
                refrenceCode: stockIn.refrenceCode,
            })
            .from(stockIn)
            .innerJoin(products, eq(stockIn.productID, products.id))
            .innerJoin(warehouses, eq(stockIn.warehouseID, warehouses.id))
            .where(eq(stockIn.id, id))

        if (stock.length === 0) return msgError(res, 404, `Stock not found`)

        return msgSuccess(res, 200, `Stock details retrieved successfully`, stock)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const createStockIn = async (req, res) => {
    try {
        const body = await parseBody(req)

        const validation = stockInValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { date, productID, warehouseID, quantity, sourceType, sourceDetail, refrenceCode, notes } = validation.data

        const existing = await db
            .select({
                id: stockIn.id
            })
            .from(stockIn)
            .where(
                eq(stockIn.refrenceCode, refrenceCode),
            )
            .limit(1)

        if (existing.length > 0) return msgError(res, 409, "Duplicate reference code")

        const newStockIn = {
            id: UUID(),
            date: new Date(date),
            productID,
            warehouseID,
            quantity: Number(quantity),
            sourceType: sourceType || null,
            sourceDetail: sourceDetail || null,
            refrenceCode,
            notes: notes || null
        }

        await db.transaction(async (tx) => {

            await tx.insert(stockIn).values(newStockIn)

            await tx
                .update(stockLevels)
                .set({
                    quantity: sql`${stockLevels.quantity} + ${Number(quantity)}`
                })
                .where(
                    and(
                        eq(stockLevels.productID, productID),
                        eq(stockLevels.warehouseID, warehouseID)
                    )
                )

        })

        logger.info({
            status: true,
            action: "CREATE_STOCK_IN",
            data: newStockIn
        })

        return msgSuccess(res, 201, `Stock created successfully`, newStockIn)
    } catch (error) {

        logger.error({
            status: false,
            action: "CREATE_STOCK_IN",
            message: error.message,
        })

        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const updateStockIn = async (req, res, id) => {
    try {
        const stock = await db
            .select({
                // id: stockIn.id,
                oldQuantity: stockIn.quantity,
                oldProductID: stockIn.productID,
                oldWarehouseID: stockIn.warehouseID,
                oldNotes: stockIn.notes,
            })
            .from(stockIn)
            .where(eq(stockIn.id, id))
            .limit(1)

        if (stock.length === 0) return msgError(res, 404, "Stock not found")

        const { oldQuantity, oldProductID, oldWarehouseID, oldNotes } = stock[0]

        const body = await parseBody(req)
        const validation = stockInValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { date, productID, warehouseID, quantity, sourceType, sourceDetail, refrenceCode, notes } = validation.data

        const existing = await db
            .select({
                id: stockIn.id
            })
            .from(stockIn)
            .where(
                and(
                    ne(stockIn.id, id),
                    eq(stockIn.refrenceCode, refrenceCode),
                )
            )
            .limit(1)

        if (existing.length > 0) return msgError(res, 409, "Duplicate reference code")

        await db.transaction(async (tx) => {

            const [stockLevel] = await tx
                .select({ quantity: stockLevels.quantity })
                .from(stockLevels)
                .where(
                    and(
                        eq(stockLevels.productID, oldProductID),
                        eq(stockLevels.warehouseID, oldWarehouseID)
                    )
                )
                .limit(1)

            if (!stockLevel) throw new Error("Stock not found")

            if (stockLevel.quantity < oldQuantity) throw new Error("Insufficient stock")

            await tx
                .update(stockLevels)
                .set({
                    quantity: sql`${stockLevels.quantity} - ${oldQuantity}`
                })
                .where(
                    and(
                        eq(stockLevels.productID, oldProductID),
                        eq(stockLevels.warehouseID, oldWarehouseID)
                    )
                )

            await tx
                .update(stockLevels)
                .set({
                    quantity: sql`${stockLevels.quantity} + ${Number(quantity)}`
                })
                .where(
                    and(
                        eq(stockLevels.productID, productID),
                        eq(stockLevels.warehouseID, warehouseID)
                    )
                )

            const updateStockIn = {
                date: new Date(date),
                productID,
                warehouseID,
                quantity: Number(quantity),
                sourceType: sourceType || null,
                sourceDetail: sourceDetail || null,
                refrenceCode,
                notes: notes || null
            }

            await tx
                .update(stockIn)
                .set(updateStockIn)
                .where(eq(stockIn.id, id))


            logger.info({
                status: true,
                action: "UPDATE_STOCK_IN",
                oldData: {
                    id,
                    oldQuantity,
                    oldProductID,
                    oldWarehouseID,
                    oldNotes,
                },
                newData: { id, ...updateStockIn }
            })
        })

        return msgSuccess(res, 200, `Stock updated successfully`, { id })
    } catch (error) {

        logger.error({
            status: false,
            action: "UPDATE_STOCK_IN",
            message: error.message,
        })

        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const deleteStockIn = async (req, res, id) => {
    try {
        const [stock] = await db
            .select({
                // id: stockIn.id,
                productID: stockIn.productID,
                warehouseID: stockIn.warehouseID,
                quantity: stockIn.quantity
            })
            .from(stockIn)
            .where(eq(stockIn.id, id))
            .limit(1)

        if (!stock) return msgError(res, 404, "Stock not found")

        await db.transaction(async (tx) => {

            const [stockLevel] = await tx
                .select({ quantity: stockLevels.quantity })
                .from(stockLevels)
                .where(
                    and(
                        eq(stockLevels.productID, stock.productID),
                        eq(stockLevels.warehouseID, stock.warehouseID)
                    )
                )
                .limit(1)

            if (!stockLevel) throw new Error("Stock not found")

            if (stockLevel.quantity < stock.quantity) throw new Error("Insufficient stock")

            await tx
                .update(stockLevels)
                .set({
                    quantity: sql`${stockLevels.quantity} - ${stock.quantity}`
                })
                .where(
                    and(
                        eq(stockLevels.productID, stock.productID),
                        eq(stockLevels.warehouseID, stock.warehouseID),
                    )
                )

            await tx.delete(stockIn).where(eq(stockIn.id, id))

        })

        logger.info({
            status: true,
            action: "DELETE_STOCK_IN",
            id
        })

        return msgSuccess(res, 200, `Stock deleted successfully`, { id })
    } catch (error) {

        logger.error({
            status: false,
            action: "DELETE_STOCK_IN",
            message: error.message,
        })

        return msgError(res, 500, `Internal Server Error`, error)
    }
}