import { createStockLevel, deleteStockLevel, getStockLevelById, getStockLevels, updateStockLevel } from "../../controllers/stock/stockLevelController.js"
import { authMiddleware } from "../../middleware/authMiddleware.js"

export const StockLevelRouter = async (req, res) => {
    const url = req.url
    const method = req.method

    if ((url === "/api/v1/stock-levels" || url === "/api/v1/stock-levels/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getStockLevels(req, res)
    }

    if (url.startsWith("/api/v1/stock-levels/") && method === "GET") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        const id = url.split("/")[4]
        return getStockLevelById(req, res, id)
    }

    if ((url === "/api/v1/stock-levels" || url === "/api/v1/stock-levels/") && method === "POST") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        return createStockLevel(req, res)
    }

    if (url.startsWith("/api/v1/stock-levels/") && method === "PATCH") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        const id = url.split("/")[4]
        return updateStockLevel(req, res, id)
    }

    if (url.startsWith("/api/v1/stock-levels/") && method === "DELETE") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        const id = url.split("/")[4]
        return deleteStockLevel(req, res, id)
    }
}