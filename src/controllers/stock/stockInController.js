import db from "../../config/db.js"
import { warehouses, stockIn, products, stockLevels } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../utils/helper.js"
import { and, eq } from "drizzle-orm"
import { v4 as UUID } from "uuid"
import { stockInValidator } from "../../validators/index.js"

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

        await db.insert(stockIn).values(newStockIn)

        const [{ quantity: currentQuantityStockLevel }] = await db
            .select({ quantity: stockLevels.quantity })
            .from(stockLevels)
            .where(
                and(
                    eq(stockLevels.productID, productID),
                    eq(stockLevels.warehouseID, warehouseID)
                ))

        const updateStockLevel = {
            quantity: currentQuantityStockLevel + Number(quantity)
        }

        await db.update(stockLevels).set(updateStockLevel).where(
            and(
                eq(stockLevels.productID, productID),
                eq(stockLevels.warehouseID, warehouseID)
            ))
        return msgSuccess(res, 201, `Stock created successfully`, newStockIn)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const updateStockIn = async (req, res, id) => {
    try {
        const [{ id: stockInID, quantity: oldQuantityStockIn }] = await db
            .select({
                id: stockIn.id,
                quantity: stockIn.quantity
            })
            .from(stockIn)
            .where(eq(stockIn.id, id))
            .limit(1)

        if (!stockInID) return msgError(res, 404, "Stock not found")

        const body = await parseBody(req)
        const validation = stockInValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { date, productID, warehouseID, quantity, sourceType, sourceDetail, refrenceCode, notes } = validation.data

        const [{ quantity: currentQuantityStockLevel }] = await db
            .select({ quantity: stockLevels.quantity })
            .from(stockLevels)
            .where(
                and(
                    eq(stockLevels.productID, productID),
                    eq(stockLevels.warehouseID, warehouseID)
                ))

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

        const updateStockLevel = {
            quantity: currentQuantityStockLevel - oldQuantityStockIn + Number(quantity)
        }

        await db.update(stockIn).set(updateStockIn).where(eq(stockIn.id, id))

        await db.update(stockLevels).set(updateStockLevel).where(
            and(
                eq(stockLevels.productID, productID),
                eq(stockLevels.warehouseID, warehouseID)
            ))
        return msgSuccess(res, 200, `Stock updated successfully`, { id, ...updateStockIn })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const deleteStockIn = async (req, res, id) => {
    try {
        const stock = await db
            .select({ id: stockIn.id })
            .from(stockIn)
            .where(eq(stockIn.id, id))
            .limit(1)

        if (stock.length === 0) return msgError(res, 404, "Stock not found")

        const [{ quantity: currentQuantityStockIn, productID, warehouseID }] = await db
            .select({
                productID: stockIn.productID,
                warehouseID: stockIn.warehouseID,
                quantity: stockIn.quantity
            })
            .from(stockIn)
            .where(eq(stockIn.id, id))

        const [{ quantity: currentQuantityStockLevel }] = await db
            .select({ quantity: stockLevels.quantity })
            .from(stockLevels)
            .where(
                and(
                    eq(stockLevels.productID, productID),
                    eq(stockLevels.warehouseID, warehouseID)
                ))

        const updateStockLevel = {
            quantity: currentQuantityStockLevel - currentQuantityStockIn
        }

        await db
            .update(stockLevels)
            .set(updateStockLevel)
            .where(
                and(
                    eq(stockLevels.productID, productID),
                    eq(stockLevels.warehouseID, warehouseID),
                ))

        await db.delete(stockIn).where(eq(stockIn.id, id))
        return msgSuccess(res, 200, `Stock deleted successfully`, { id })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}