import db from "../../config/db.js"
import { warehouses, stockOut, products, stockLevels } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../utils/helper.js"
import { and, eq } from "drizzle-orm"
import { v4 as UUID } from "uuid"
import { stockOutValidator } from "../../validators/index.js"

export const getStockOut = async (req, res) => {
    try {
        const stock = await db
            .select({
                id: stockOut.id,
                date: stockOut.date,
                productName: products.name,
                warehouseName: warehouses.name,
                quantity: stockOut.quantity,
                refrenceCode: stockOut.refrenceCode,
            })
            .from(stockOut)
            .innerJoin(products, eq(stockOut.productID, products.id))
            .innerJoin(warehouses, eq(stockOut.warehouseID, warehouses.id))

        return msgSuccess(res, 200, `Stocks retrieved successfully`, stock)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getStockOutById = async (req, res, id) => {
    try {
        const stock = await db
            .select({
                id: stockOut.id,
                date: stockOut.date,
                productID: products.id,
                productName: products.name,
                warehouseID: warehouses.id,
                warehouseName: warehouses.name,
                quantity: stockOut.quantity,
                refrenceCode: stockOut.refrenceCode,
            })
            .from(stockOut)
            .innerJoin(products, eq(stockOut.productID, products.id))
            .innerJoin(warehouses, eq(stockOut.warehouseID, warehouses.id))
            .where(eq(stockOut.id, id))

        if (stock.length === 0) return msgError(res, 404, `Stock not found`)

        return msgSuccess(res, 200, `Stock details retrieved successfully`, stock)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const createStockOut = async (req, res) => {
    try {
        const body = await parseBody(req)

        const validation = stockOutValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { date, productID, warehouseID, quantity, destinationType, destinationDetail, refrenceCode, notes } = validation.data

        const newStockOut = {
            id: UUID(),
            date: new Date(date),
            productID,
            warehouseID,
            quantity: Number(quantity),
            destinationType: destinationType || null,
            destinationDetail: destinationDetail || null,
            refrenceCode,
            notes: notes || null
        }

        await db.insert(stockOut).values(newStockOut)

        const [{ quantity: currentQuantityStockLevel }] = await db
            .select({ quantity: stockLevels.quantity })
            .from(stockLevels)
            .where(
                and(
                    eq(stockLevels.productID, productID),
                    eq(stockLevels.warehouseID, warehouseID)
                ))

        if (currentQuantityStockLevel < Number(quantity)) return msgError(res, 400, "Insufficient stock")

        const updateStockLevel = {
            quantity: currentQuantityStockLevel - Number(quantity)
        }

        await db.update(stockLevels).set(updateStockLevel).where(
            and(
                eq(stockLevels.productID, productID),
                eq(stockLevels.warehouseID, warehouseID)
            ))
        return msgSuccess(res, 201, `Stock created successfully`, newStockOut)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const updateStockOut = async (req, res, id) => {
    try {
        const [{ id: stockOutID, quantity: oldQuantityStockOut }] = await db
            .select({
                id: stockOut.id,
                quantity: stockOut.quantity
            })
            .from(stockOut)
            .where(eq(stockOut.id, id))
            .limit(1)

        if (!stockOutID) return msgError(res, 404, "Stock not found")

        const body = await parseBody(req)
        const validation = stockOutValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { date, productID, warehouseID, quantity, destinationType, destinationDetail, refrenceCode, notes } = validation.data

        const [{ quantity: currentQuantityStockLevel }] = await db
            .select({ quantity: stockLevels.quantity })
            .from(stockLevels)
            .where(
                and(
                    eq(stockLevels.productID, productID),
                    eq(stockLevels.warehouseID, warehouseID)
                ))

        const updateStockOut = {
            date: new Date(date),
            productID,
            warehouseID,
            quantity: Number(quantity),
            destinationType: destinationType || null,
            destinationDetail: destinationDetail || null,
            refrenceCode,
            notes: notes || null
        }

        const updateStockLevel = {
            quantity: currentQuantityStockLevel + oldQuantityStockOut - Number(quantity)
        }

        await db.update(stockOut).set(updateStockOut).where(eq(stockOut.id, id))

        await db.update(stockLevels).set(updateStockLevel).where(
            and(
                eq(stockLevels.productID, productID),
                eq(stockLevels.warehouseID, warehouseID)
            ))
        return msgSuccess(res, 200, `Stock updated successfully`, { id, ...updateStockOut })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const deleteStockOut = async (req, res, id) => {
    try {
        const stock = await db
            .select({ id: stockOut.id })
            .from(stockOut)
            .where(eq(stockOut.id, id))
            .limit(1)

        if (stock.length === 0) return msgError(res, 404, "Stock not found")

        const [{ quantity: currentQuantityStockOut, productID, warehouseID }] = await db
            .select({
                productID: stockOut.productID,
                warehouseID: stockOut.warehouseID,
                quantity: stockOut.quantity
            })
            .from(stockOut)
            .where(eq(stockOut.id, id))

        const [{ quantity: currentQuantityStockLevel }] = await db
            .select({ quantity: stockLevels.quantity })
            .from(stockLevels)
            .where(
                and(
                    eq(stockLevels.productID, productID),
                    eq(stockLevels.warehouseID, warehouseID)
                ))

        const updateStockLevel = {
            quantity: currentQuantityStockLevel + currentQuantityStockOut
        }

        await db
            .update(stockLevels)
            .set(updateStockLevel)
            .where(
                and(
                    eq(stockLevels.productID, productID),
                    eq(stockLevels.warehouseID, warehouseID),
                ))

        await db.delete(stockOut).where(eq(stockOut.id, id))
        return msgSuccess(res, 200, `Stock deleted successfully`, { id })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}