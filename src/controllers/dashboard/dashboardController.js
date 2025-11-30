import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm"
import db from "../../config/db.js"
import { msgError, msgSuccess } from "../../utils/helper.js"
import { categories, products, stockIn, stockLevels, stockOut, warehouses } from "../../schema.js"
import { unionAll } from "drizzle-orm/mysql-core"

export const getSummary = async (req, res) => {
    try {
        const [totalProducts] = await db
            .select({
                total: count(products.id)
            })
            .from(products)

        const [totalStocks] = await db
            .select({
                total: sum(stockLevels.quantity)
                    .mapWith(Number)
            })
            .from(stockLevels)

        const [totalStockInMonth] = await db
            .select({
                total: sum(stockIn.quantity)
                    .mapWith(Number)
            })
            .from(stockIn)
            .where(
                and(
                    gte(stockIn.date, new Date("2025-11-01")),
                    lte(stockIn.date, new Date("2025-11-30"))
                )
            )

        const [totalStockOutMonth] = await db
            .select({
                total: sum(stockOut.quantity)
                    .mapWith(Number)
            })
            .from(stockOut)
            .where(
                and(
                    gte(stockOut.date, new Date("2025-11-01")),
                    lte(stockOut.date, new Date("2025-11-30"))
                )
            )

        return msgSuccess(res, 200, "Summary retrieved successfully", {
            totalProducts: totalProducts.total,
            totalStocks: totalStocks.total,
            totalStockInMonth: totalStockInMonth.total,
            totalStockOutMonth: totalStockOutMonth.total
        });
    } catch (error) {
        return msgError(res, 500, "Internal server error", error)
    }
}

export const getRecentActivities = async (req, res) => {
    try {

        const StockIn = db
            .select({
                type: sql`"in"`,
                productName: products.name,
                warehouseName: warehouses.name,
                quantity: stockIn.quantity,
                date: stockIn.date
            })
            .from(stockIn)
            .innerJoin(products, eq(products.id, stockIn.productID))
            .innerJoin(warehouses, eq(warehouses.id, stockIn.warehouseID))

        const StockOut = db
            .select({
                type: sql`"out"`,
                productName: products.name,
                warehouseName: warehouses.name,
                quantity: stockOut.quantity,
                date: stockOut.date
            })
            .from(stockOut)
            .innerJoin(products, eq(products.id, stockOut.productID))
            .innerJoin(warehouses, eq(warehouses.id, stockOut.warehouseID))

        const recentActivities = await unionAll(
            StockIn,
            StockOut
        )
            .orderBy(desc(sql`quantity`))
            .limit(5)

        return msgSuccess(res, 200, `Recent activities retrieved successfully`, recentActivities)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getLineData = async (req, res) => {
    try {

        const StockIn = await db
            .select({
                date: sql`DATE(${stockIn.date})`,
                quantity: sum(stockIn.quantity).mapWith(Number)
            })
            .from(stockIn)
            .where(sql`EXTRACT(MONTH FROM ${stockIn.date}) = 11`)
            .groupBy(sql`DATE(${stockIn.date})`)
            .orderBy(sql`DATE(${stockIn.date})`)

        const StockOut = await db
            .select({
                date: sql`DATE(${stockOut.date})`.as("date"),
                quantity: sum(stockOut.quantity).mapWith(Number)
            })
            .from(stockOut)
            .where(sql`EXTRACT(MONTH FROM ${stockOut.date}) = 11`)
            .groupBy(sql`DATE(${stockOut.date})`)
            .orderBy(sql`DATE(${stockOut.date})`)

        const line = {}

        StockIn.forEach(data => {
            line[data.date] = { date: data.date, in: data.quantity, out: 0 }
        })

        StockOut.forEach(data => {
            if (!line[data.date]) line[data.date] = { date: data.date, in: 0, out: data.quantity }
            else line[data.date].out = data.quantity
        })

        const LineData = Object.values(line)

        return msgSuccess(res, 200, `Line data retrieved successfully`, LineData)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getBarData = async (req, res) => {
    try {

        const totalProductByCategories = await db
            .select({
                name: categories.name,
                total: count(products.id)
            })
            .from(categories)
            .leftJoin(products, eq(categories.id, products.categoryID))
            .groupBy(categories.id)

        return msgSuccess(res, 200, `Bar data retrieved successfully`, totalProductByCategories)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}