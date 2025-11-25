import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../../controllers/master/productsController.js"
import { authMiddleware } from "../../middleware/authMiddleware.js"

export const ProductRouter = async (req, res) => {
    const url = req.url
    const method = req.method

    if ((url === "/api/v1/products" || url === "/api/v1/products/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getProducts(req, res)
    }

    if (url.startsWith("/api/v1/products/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        const id = url.split("/")[4]
        return getProductById(req, res, id)
    }

    if ((url === "/api/v1/products" || url === "/api/v1/products/") && method === "POST") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        return createProduct(req, res)
    }

    if (url.startsWith("/api/v1/products/") && method === "PATCH") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        const id = url.split("/")[4]
        return updateProduct(req, res, id)
    }

    if (url.startsWith("/api/v1/products/") && method === "DELETE") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        const id = url.split("/")[4]
        return deleteProduct(req, res, id)
    }
}