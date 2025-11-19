import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../../controllers/master/categoryController.js"
import { authMiddleware } from "../../middleware/authMiddleware.js"

export const CategoryRouter = async (req, res) => {
    const url = req.url
    const method = req.method

    if ((url === "/api/v1/categories" || url === "/api/v1/categories/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getCategories(req, res)
    }

    if (url.startsWith("/api/v1/categories/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        const id = url.split("/")[4]
        return getCategoryById(req, res, id)
    }

    if ((url === "/api/v1/categories" || url === "/api/v1/categories/") && method === "POST") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return createCategory(req, res)
    }

    if (url.startsWith("/api/v1/categories/") && method === "PATCH") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        const id = url.split("/")[4]
        return updateCategory(req, res, id)
    }

    if (url.startsWith("/api/v1/categories/") && method === "DELETE") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        const id = url.split("/")[4]
        return deleteCategory(req, res, id)
    }
}