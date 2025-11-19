import { createStockIn, deleteStockIn, getStockIn, getStockInById, updateStockIn } from "../../controllers/stock/stockInController.js"
import { authMiddleware } from "../../middleware/authMiddleware.js"

export const StockInRouter = async (req, res) => {
    const url = req.url
    const method = req.method

    if ((url === "/api/v1/stock-in" || url === "/api/v1/stock-in/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getStockIn(req, res)
    }

    if (url.startsWith("/api/v1/stock-in/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        const id = url.split("/")[4]
        return getStockInById(req, res, id)
    }

    if ((url === "/api/v1/stock-in" || url === "/api/v1/stock-in/") && method === "POST") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return createStockIn(req, res)
    }

    if (url.startsWith("/api/v1/stock-in/") && method === "PATCH") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        const id = url.split("/")[4]
        return updateStockIn(req, res, id)
    }

    if (url.startsWith("/api/v1/stock-in/") && method === "DELETE") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        const id = url.split("/")[4]
        return deleteStockIn(req, res, id)
    }
}