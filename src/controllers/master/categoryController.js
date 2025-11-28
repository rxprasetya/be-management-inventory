import db from "../../config/db.js"
import { categories, products } from "../../schema.js"
import { msgError, msgSuccess, parseBody } from "../../utils/helper.js"
import { eq, and, ne } from "drizzle-orm"
import { v4 as UUID } from "uuid"
import { categoryValidator } from "../../validators/index.js"

export const getCategories = async (req, res) => {
    try {
        const category = await db
            .select({
                id: categories.id,
                name: categories.name,
                description: categories.description,
            })
            .from(categories)
            .orderBy(categories.name)

        return msgSuccess(res, 200, `Categories retrieved successfully`, category)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const getCategoryById = async (req, res, id) => {
    try {
        const category = await db
            .select({
                id: categories.id,
                name: categories.name,
                description: categories.description,
            })
            .from(categories)
            .where(eq(categories.id, id))

        if (category.length === 0) return msgError(res, 404, `Category not found`)

        return msgSuccess(res, 200, `Category details retrieved successfully`, category)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const createCategory = async (req, res) => {
    try {
        const body = await parseBody(req)
        const validation = categoryValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { name, description } = validation.data

        const existing = await db
            .select({
                id: categories.id
            })
            .from(categories)
            .where(eq(categories.name, name))
            .limit(1)

        if (existing.length > 0) return msgError(res, 409, "Duplicate category.")

        const newCategory = {
            id: UUID(),
            name,
            description: description || null,
        }

        await db.insert(categories).values(newCategory)
        return msgSuccess(res, 201, `Category created successfully`, newCategory)
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const updateCategory = async (req, res, id) => {
    try {
        const category = await db
            .select({ id: categories.id })
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1)

        if (category.length === 0) return msgError(res, 404, "Category not found")

        const body = await parseBody(req)
        const validation = categoryValidator.safeParse(body)

        if (!validation.success) {
            const { fieldErrors } = validation.error.flatten()
            return msgError(res, 400, "Validation error", fieldErrors)
        }

        const { name, description } = validation.data

        const existing = await db
            .select({
                id: categories.id
            })
            .from(categories)
            .where(
                and(
                    eq(categories.name, name),
                    ne(categories.id, id)
                )
            )
            .limit(1)

        if (existing.length > 0) return msgError(res, 409, "Duplicate category.")

        const updateCategory = {
            name,
            description: description || null
        }

        await db.update(categories).set(updateCategory).where(eq(categories.id, id))
        return msgSuccess(res, 200, `Category updated successfully`, { id, ...updateCategory })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}

export const deleteCategory = async (req, res, id) => {
    try {
        const category = await db
            .select({ id: categories.id })
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1)

        if (category.length === 0) return msgError(res, 404, "Category not found")

        const relatedProduct = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.categoryID, id))
            .limit(1)

        if (relatedProduct.length > 0) return msgError(res, 400, "Category still in use by products.")

        await db.delete(categories).where(eq(categories.id, id))
        return msgSuccess(res, 200, `Category deleted successfully`, { id })
    } catch (error) {
        return msgError(res, 500, `Internal Server Error`, error)
    }
}
