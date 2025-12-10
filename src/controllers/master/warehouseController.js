import db from "../../config/db.js"
import { stockIn, stockLevels, stockOut, stockTransfers, warehouses } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../utils/helper.js"
import { and, eq, ne } from "drizzle-orm"
import { v4 as UUID } from "uuid"
import { warehouseValidator } from "../../validators/index.js"
import logger from "../../logger/index.js"

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

        const existing = await db
            .select({
                id: warehouses.id
            })
            .from(warehouses)
            .where(eq(warehouses.name, name))
            .limit(1)

        if (existing.length > 0) return msgError(res, 409, "Duplicate warehouse.")

        const newWarehouse = {
            id: UUID(),
            name,
            location: location || null,
        }

        await db.insert(warehouses).values(newWarehouse)

        logger.info({
            status: true,
            action: "CREATE_WAREHOUSE",
            data: newWarehouse
        })

        return msgSuccess(res, 201, `Warehouse created successfully`, newWarehouse)
    } catch (error) {

        logger.error({
            status: false,
            action: "CREATE_WAREHOUSE",
            message: error.message,
        })

        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const updateWarehouse = async (req, res, id) => {
    try {
        const warehouse = await db
            .select({
                // id: warehouses.id,
                oldName: warehouses.name,
                oldLocation: warehouses.location
            })
            .from(warehouses)
            .where(eq(warehouses.id, id))
            .limit(1)

        if (warehouse.length === 0) return msgError(res, 404, "Warehouse not found")

        const { oldName, oldLocation } = warehouse[0]

        const body = await parseBody(req)
        const validation = warehouseValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { name, location } = validation.data

        const existing = await db
            .select({
                id: warehouses.id
            })
            .from(warehouses)
            .where(
                and(
                    eq(warehouses.name, name),
                    ne(warehouses.id, id)
                )
            )
            .limit(1)

        if (existing.length > 0) return msgError(res, 409, "Duplicate warehouse.")

        const updateWarehouse = {
            name,
            location: location || null
        }

        await db.update(warehouses).set(updateWarehouse).where(eq(warehouses.id, id))

        logger.info({
            status: true,
            action: "UPDATE_WAREHOUSE",
            oldData: {
                id,
                oldName,
                oldLocation
            },
            newData: { id, ...updateWarehouse }
        })

        return msgSuccess(res, 200, `Warehouse updated successfully`, { id, ...updateWarehouse })
    } catch (error) {

        logger.error({
            status: false,
            action: "UPDATE_WAREHOUSE",
            message: error.message,
        })

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

        if (relatedStockLevel.length > 0) return msgError(res, 400, "Warehouse still in use by stock.")

        const relatedStockIn = await db
            .select({ id: stockIn.id })
            .from(stockIn)
            .where(eq(stockIn.warehouseID, id))
            .limit(1)

        if (relatedStockIn.length > 0) return msgError(res, 400, "Warehouse still in use by stock in.")

        const relatedStockOut = await db
            .select({ id: stockOut.id })
            .from(stockOut)
            .where(eq(stockOut.productID, id))
            .limit(1)

        if (relatedStockOut.length > 0) return msgError(res, 400, "Warehouse still in use by stock out.")

        // const relatedStockTransfer = await db
        //     .select({ id: stockTransfers.id })
        //     .from(stockTransfers)
        //     .where(eq(stockTransfers.productID, id))
        //     .limit(1)

        // if (relatedStockTransfer.length > 0) return msgError(res, 400, "Cannot delete warehouse: still referenced in stock transfers")

        await db.delete(warehouses).where(eq(warehouses.id, id))

        logger.info({
            status: true,
            action: "DELETE_WAREHOUSE",
            id
        })

        return msgSuccess(res, 200, `Warehouse deleted successfully`, { id })
    } catch (error) {

        logger.error({
            status: false,
            action: "DELETE_WAREHOUSE",
            message: error.message,
        })

        return msgError(res, 500, `Internal Server Error`, error)
    }
}
