import db from "../../config/db.js"
import { warehouses, stockTransfers, products } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../helper.js"
import { aliasedTable, eq } from "drizzle-orm"
import { v4 as UUID } from "uuid"
import { stockTransferValidator } from "../../validators/index.js"

const fromWarehouse = aliasedTable(warehouses, "fromWarehouse");
const toWarehouse = aliasedTable(warehouses, "toWarehouse");

export const getStockTransfers = async (req, res) => {
    try {
        const stockTransfer = await db
            .select({
                id: stockTransfers.id,
                date: stockTransfers.date,
                productName: products.name,
                fromWarehouseName: fromWarehouse.name,
                toWarehouseName: toWarehouse.name,
                quantity: stockTransfers.quantity,
                status: stockTransfers.status
            })
            .from(stockTransfers)
            .innerJoin(products, eq(stockTransfers.productID, products.id))
            .innerJoin(warehouses, eq(stockTransfers.fromWarehouseID, fromWarehouse.id))
            .innerJoin(warehouses, eq(stockTransfers.toWarehouseID, toWarehouse.id))
            .orderBy(desc(stockTransfers.date));

        return msgSuccess(res, 200, `Stocks retrieved successfully`, stockTransfer)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getStockTransferById = async (req, res, id) => {
    try {
        const stockTransfer = await db
            .select({
                id: stockTransfers.id,
                date: stockTransfers.date,
                productName: products.name,
                fromWarehouseID: fromWarehouse.id,
                fromWarehouseName: fromWarehouse.name,
                toWarehouseID: toWarehouse.id,
                toWarehouseName: toWarehouse.name,
                quantity: stockTransfers.quantity,
                status: stockTransfers.status
            })
            .from(stockTransfers)
            .innerJoin(products, eq(stockTransfers.productID, products.id))
            .innerJoin(warehouses, eq(stockTransfers.fromWarehouseID, fromWarehouse.id))
            .innerJoin(warehouses, eq(stockTransfers.toWarehouseID, toWarehouse.id))
            .where(eq(stockTransfers.id, id))

        if (stockTransfer.length === 0) return msgError(res, 404, `Stock not found`)

        return msgSuccess(res, 200, `Stock details retrieved successfully`, stockTransfer)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const createStockTransfer = async (req, res) => {
    try {
        const body = await parseBody(req)
        const validation = stockTransferValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { date, productID, fromWarehouseID, toWarehouseID, quantity, refrenceCode, status } = validation.data

        const newStockTransfer = {
            id: UUID(),
            date: new Date(date),
            productID,
            fromWarehouseID,
            toWarehouseID,
            quantity: Number(quantity),
            refrenceCode,
            status,
        }

        await db.insert(stockTransfers).values(newStockTransfer)
        return msgSuccess(res, 201, `Stock created successfully`, newStockTransfer)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const updateStockTransfer = async (req, res, id) => {
    try {
        const stockTransfer = await db
            .select({ id: stockTransfers.id })
            .from(stockTransfers)
            .where(eq(stockTransfers.id, id))
            .limit(1)

        if (stockTransfer.length === 0) return msgError(res, 404, "Stock not found")

        const body = await parseBody(req)
        const validation = stockTransferValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { productID, warehouseID, quantity } = validation.data

        const updatestockTransfer = {
            productID,
            warehouseID,
            quantity: Number(quantity),
        }

        await db.update(stockTransfers).set(updatestockTransfer).where(eq(stockTransfers.id, id))
        return msgSuccess(res, 200, `Stock updated successfully`, { id, ...updatestockTransfer })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const deleteStockTransfer = async (req, res, id) => {
    try {
        const stockTransfer = await db
            .select({ id: stockTransfers.id })
            .from(stockTransfers)
            .where(eq(stockTransfers.id, id))
            .limit(1)

        if (stockTransfer.length === 0) return msgError(res, 404, "Stock not found")

        await db.delete(stockTransfers).where(eq(stockTransfers.id, id))
        return msgSuccess(res, 200, `Stock deleted successfully`, { id })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}