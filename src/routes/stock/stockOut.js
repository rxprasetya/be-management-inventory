import { createStockOut, deleteStockOut, getStockOut, getStockOutById, updateStockOut } from "../../controllers/stock/stockOutController.js"
import { authMiddleware } from "../../middleware/authMiddleware.js"

export const StockOutRouter = async (req, res) => {
    const url = req.url
    const method = req.method

    if ((url === "/api/v1/stock-out" || url === "/api/v1/stock-out/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getStockOut(req, res)
    }

    if (url.startsWith("/api/v1/stock-out/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        const id = url.split("/")[4]
        return getStockOutById(req, res, id)
    }

    if ((url === "/api/v1/stock-out" || url === "/api/v1/stock-out/") && method === "POST") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        return createStockOut(req, res)
    }

    if (url.startsWith("/api/v1/stock-out/") && method === "PATCH") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        const id = url.split("/")[4]
        return updateStockOut(req, res, id)
    }

    if (url.startsWith("/api/v1/stock-out/") && method === "DELETE") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        const id = url.split("/")[4]
        return deleteStockOut(req, res, id)
    }
}