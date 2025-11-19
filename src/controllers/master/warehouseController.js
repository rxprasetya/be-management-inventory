import db from "../../config/db.js"
import { stockIn, stockLevels, stockOut, stockTransfers, warehouses } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../utils/helper.js"
import { eq } from "drizzle-orm"
import { v4 as UUID } from "uuid"
import { warehouseValidator } from "../../validators/index.js"

export const getWarehouses = async (req, res) => {
    try {
        const warehouse = await db
            .select({
                id: warehouses.id,
                name: warehouses.name,
                location: warehouses.location,
            })
            .from(warehouses)
            .orderBy(warehouses.name)

        return msgSuccess(res, 200, `Warehouses retrieved successfully`, warehouse)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getWarehouseById = async (req, res, id) => {
    try {
        const warehouse = await db
            .select({
                id: warehouses.id,
                name: warehouses.name,
                location: warehouses.location,
            })
            .from(warehouses)
            .where(eq(warehouses.id, id))

        if (warehouse.length === 0) return msgError(res, 404, `Warehouse not found`)

        return msgSuccess(res, 200, `Warehouse details retrieved successfully`, warehouse)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const createWarehouse = async (req, res) => {
    try {
        const body = await parseBody(req)
        const validation = warehouseValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { name, location } = validation.data

        const newWarehouse = {
            id: UUID(),
            name,
            location: location || null,
        }

        await db.insert(warehouses).values(newWarehouse)
        return msgSuccess(res, 201, `Warehouse created successfully`, newWarehouse)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const updateWarehouse = async (req, res, id) => {
    try {
        const warehouse = await db
            .select({ id: warehouses.id })
            .from(warehouses)
            .where(eq(warehouses.id, id))
            .limit(1)

        if (warehouse.length === 0) return msgError(res, 404, "Warehouse not found")

        const body = await parseBody(req)
        const validation = warehouseValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { name, location } = validation.data

        const updateWarehouse = {
            name,
            location: location || null
        }

        await db.update(warehouses).set(updateWarehouse).where(eq(warehouses.id, id))
        return msgSuccess(res, 200, `Warehouse updated successfully`, { id, ...updateWarehouse })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const deleteWarehouse = async (req, res, id) => {
    try {
        const warehouse = await db
            .select({ id: warehouses.id })
            .from(warehouses)
            .where(eq(warehouses.id, id))
            .limit(1)

        if (warehouse.length === 0) return msgError(res, 404, "Warehouse not found")

        const relatedStockLevel = await db
            .select({ id: stockLevels.id })
            .from(stockLevels)
            .where(eq(stockLevels.warehouseID, id))
            .limit(1)

        if (relatedStockLevel.length > 0) return msgError(res, 400, "Cannot delete warehouse: still referenced in stock levels")

        const relatedStockIn = await db
            .select({ id: stockIn.id })
            .from(stockIn)
            .where(eq(stockIn.warehouseID, id))
            .limit(1)

        if (relatedStockIn.length > 0) return msgError(res, 400, "Cannot delete warehouse: still referenced in stock in")

        const relatedStockOut = await db
            .select({ id: stockOut.id })
            .from(stockOut)
            .where(eq(stockOut.productID, id))
            .limit(1)

        if (relatedStockOut.length > 0) return msgError(res, 400, "Cannot delete warehouse: still referenced in stock out")

        const relatedStockTransfer = await db
            .select({ id: stockTransfers.id })
            .from(stockTransfers)
            .where(eq(stockTransfers.productID, id))
            .limit(1)

        if (relatedStockTransfer.length > 0) return msgError(res, 400, "Cannot delete warehouse: still referenced in stock transfers")

        await db.delete(warehouses).where(eq(warehouses.id, id))
        return msgSuccess(res, 200, `Warehouse deleted successfully`, { id })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}
