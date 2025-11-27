import { msgError, msgSuccess } from "../../utils/helper.js"
import db from "../../config/db.js"
import { eq } from "drizzle-orm"
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
        return msgSuccess(res, 200, `Products retrieved successfully`, productInStocks)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getWarehouseInStocks = async (req, res) => {
    try {
        const warehouseInStocks = await db
            .selectDistinct({
                warehouseID: warehouses.id,
                warehouseName: warehouses.name
            })
            .from(warehouses)
            .innerJoin(stockLevels, eq(warehouses.id, stockLevels.warehouseID))
        return msgSuccess(res, 200, `Warehouses retrieved successfully`, warehouseInStocks)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}