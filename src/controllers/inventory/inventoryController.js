import { msgError, msgSuccess } from "../../utils/helper.js"
import db from "../../config/db.js"
import { and, eq, lte } from "drizzle-orm"
import { warehouses, stockLevels, products } from "../../schema.js"

export const getProductInStocks = async (req, res) => {
    try {
        const productInStocks = await db
            .selectDistinct({
                productID: products.id,
                productName: products.name
            })
            .from(products)
            .innerJoin(stockLevels, eq(products.id, stockLevels.productID))
            .orderBy(products.name)
        return msgSuccess(res, 200, `Products retrieved successfully`, productInStocks)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getWarehouseInStocksByProductId = async (req, res, productID) => {
    try {
        const warehouseInStocks = await db
            .selectDistinct({
                warehouseID: warehouses.id,
                warehouseName: warehouses.name
            })
            .from(warehouses)
            .innerJoin(stockLevels, and(
                eq(warehouses.id, stockLevels.warehouseID),
                eq(stockLevels.productID, productID)
            ))
            .orderBy(warehouses.name)
        return msgSuccess(res, 200, `Warehouses retrieved successfully`, warehouseInStocks)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getEmptyOrLowProductStocks = async (req, res) => {
    try {
        const emptyOrLowProductStocks = await db
            .select({
                id: stockLevels.id
            })
            .from(stockLevels)
            .innerJoin(products, eq(products.id, stockLevels.productID))
            .where(lte(stockLevels.quantity, products.minStock))

        return msgSuccess(res, 200, `Notification retrieved successfully`, emptyOrLowProductStocks)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}