import db from "../../config/db.js"
import { warehouses, stockOut, products, stockLevels } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../utils/helper.js"
import { and, eq, sql } from "drizzle-orm"
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
            .orderBy(desc(stockOut.date))

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

        const existing = await db
            .select({
                id: stockOut.id
            })
            .from(stockOut)
            .where(
                eq(stockOut.refrenceCode, refrenceCode),
            )
            .limit(1)

        if (existing.length > 0) return msgError(res, 409, "Duplicate reference code.")

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

        await db.transaction(async (tx) => {

            const [stockLevel] = await tx
                .select({ quantity: stockLevels.quantity })
                .from(stockLevels)
                .where(
                    and(
                        eq(stockLevels.productID, productID),
                        eq(stockLevels.warehouseID, warehouseID)
                    )
                )
                .limit(1)

            if (!stockLevel) throw new Error("Stock not found")

            if (stockLevel.quantity < Number(quantity)) throw new Error("Insufficient stock")

            await tx.insert(stockOut).values(newStockOut)

            await tx
                .update(stockLevels)
                .set({ quantity: sql`${stockLevels.quantity} - ${Number(quantity)}` })
                .where(
                    and(
                        eq(stockLevels.productID, productID),
                        eq(stockLevels.warehouseID, warehouseID),
                    )
                )

        })

        return msgSuccess(res, 201, `Stock created successfully`, newStockOut)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const updateStockOut = async (req, res, id) => {
    try {
        const stock = await db
            .select({
                id: stockOut.id,
                oldQuantity: stockOut.quantity,
                oldProductID: stockOut.productID,
                oldWarehouseID: stockOut.warehouseID
            })
            .from(stockOut)
            .where(eq(stockOut.id, id))
            .limit(1)

        if (stock.length === 0) return msgError(res, 404, "Stock not found")

        const { oldQuantity, oldProductID, oldWarehouseID } = stock[0]

        const body = await parseBody(req)
        const validation = stockOutValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { date, productID, warehouseID, quantity, destinationType, destinationDetail, refrenceCode, notes } = validation.data

        const existing = await db
            .select({
                id: stockOut.id
            })
            .from(stockOut)
            .where(
                and(
                    ne(stockOut.id, id),
                    eq(stockOut.refrenceCode, refrenceCode),
                )
            )
            .limit(1)

        if (existing.length > 0) return msgError(res, 409, "Duplicate reference code.")

        await db.transaction(async (tx) => {

            const [newStockLevel] = await tx
                .select({ quantity: stockLevels.quantity })
                .from(stockLevels)
                .where(
                    and(
                        eq(stockLevels.productID, productID),
                        eq(stockLevels.warehouseID, warehouseID)
                    )
                )
                .limit(1)

            if (!newStockLevel) throw new Error("Stock not found")

            if (newStockLevel.quantity < Number(quantity)) throw new Error("Insufficient stock")

            await tx
                .update(stockLevels)
                .set({ quantity: sql`${stockLevels.quantity} + ${oldQuantity}` })
                .where(
                    and(
                        eq(stockLevels.productID, oldProductID),
                        eq(stockLevels.warehouseID, oldWarehouseID)
                    )
                )

            await tx
                .update(stockLevels)
                .set({ quantity: sql`${stockLevels.quantity} - ${Number(quantity)}` })
                .where(
                    and(
                        eq(stockLevels.productID, productID),
                        eq(stockLevels.warehouseID, warehouseID)
                    )
                )

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

            await tx
                .update(stockOut)
                .set(updateStockOut)
                .where(eq(stockOut.id, id))

        })

        return msgSuccess(res, 200, `Stock updated successfully`, { id })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const deleteStockOut = async (req, res, id) => {
    try {
        const [stock] = await db
            .select({
                id: stockOut.id,
                productID: stockOut.productID,
                warehouseID: stockOut.warehouseID,
                quantity: stockOut.quantity,
            })
            .from(stockOut)
            .where(eq(stockOut.id, id))
            .limit(1)

        if (!stock) return msgError(res, 404, "Stock not found")

        await db.transaction(async (tx) => {
            await tx
                .update(stockLevels)
                .set({ quantity: sql`${stockLevels.quantity} + ${stock.quantity}` })
                .where(
                    and(
                        eq(stockLevels.productID, stock.productID),
                        eq(stockLevels.warehouseID, stock.warehouseID),
                    )
                )

            await tx.delete(stockOut).where(eq(stockOut.id, id))
        })

        return msgSuccess(res, 200, `Stock deleted successfully`, { id })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}