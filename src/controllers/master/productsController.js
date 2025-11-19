import db from "../../config/db.js"
import { categories, products, stockIn, stockLevels, stockOut, stockTransfers } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../utils/helper.js"
import { eq } from "drizzle-orm"
import { v4 as UUID } from "uuid"
import { productValidator } from "../../validators/index.js"

export const getProducts = async (req, res) => {
    try {
        const product = await db
            .select({
                id: products.id,
                name: products.name,
                categoryName: categories.name,
                unit: products.unit,
                description: products.description,
                minStock: products.minStock,
            })
            .from(products)
            .innerJoin(categories, eq(products.categoryID, categories.id))
            .orderBy(products.name)

        return msgSuccess(res, 200, `Products retrieved successfully`, product)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getProductById = async (req, res, id) => {
    try {
        const product = await db
            .select({
                id: products.id,
                name: products.name,
                categoryID: categories.id,
                categoryName: categories.name,
                unit: products.unit,
                description: products.description,
                minStock: products.minStock,
            })
            .from(products)
            .innerJoin(categories, eq(products.categoryID, categories.id))
            .where(eq(products.id, id))

        if (product.length === 0) return msgError(res, 404, `Product not found`)

        return msgSuccess(res, 200, `Product details retrieved successfully`, product)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const createProduct = async (req, res) => {
    try {
        const body = await parseBody(req)
        const validation = productValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { sku, name, categoryID, unit, description, minStock } = validation.data

        const newProduct = {
            id: UUID(),
            sku: sku || null,
            name,
            categoryID,
            unit,
            description: description || null,
            minStock: Number(minStock)
        }

        await db.insert(products).values(newProduct)
        return msgSuccess(res, 201, `Product created successfully`, newProduct)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const updateProduct = async (req, res, id) => {
    try {
        const product = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.id, id))
            .limit(1)

        if (product.length === 0) return msgError(res, 404, "Product not found")

        const body = await parseBody(req)
        const validation = productValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { sku, name, categoryID, unit, description, minStock } = validation.data

        const updateProduct = {
            sku: sku || null,
            name,
            categoryID,
            unit,
            description: description || null,
            minStock: Number(minStock)
        }

        await db.update(products).set(updateProduct).where(eq(products.id, id))
        return msgSuccess(res, 200, `Product updated successfully`, { id, ...updateProduct })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const deleteProduct = async (req, res, id) => {
    try {
        const product = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.id, id))
            .limit(1)

        if (product.length === 0) return msgError(res, 404, "Product not found")

        const relatedStockLevel = await db
            .select({ id: stockLevels.id })
            .from(stockLevels)
            .where(eq(stockLevels.productID, id))
            .limit(1)

        if (relatedStockLevel.length > 0) return msgError(res, 400, "Cannot delete product: still referenced in stock levels")

        const relatedStockIn = await db
            .select({ id: stockIn.id })
            .from(stockIn)
            .where(eq(stockIn.productID, id))
            .limit(1)

        if (relatedStockIn.length > 0) return msgError(res, 400, "Cannot delete product: still referenced in stock in")

        const relatedStockOut = await db
            .select({ id: stockOut.id })
            .from(stockOut)
            .where(eq(stockOut.productID, id))
            .limit(1)

        if (relatedStockOut.length > 0) return msgError(res, 400, "Cannot delete product: still referenced in stock out")

        const relatedStockTransfer = await db
            .select({ id: stockTransfers.id })
            .from(stockTransfers)
            .where(eq(stockTransfers.productID, id))
            .limit(1)

        if (relatedStockTransfer.length > 0) return msgError(res, 400, "Cannot delete product: still referenced in stock transfers")

        await db.delete(products).where(eq(products.id, id))
        return msgSuccess(res, 200, `Product deleted successfully`, { id })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}