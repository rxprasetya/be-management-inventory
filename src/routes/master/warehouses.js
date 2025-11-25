import { createWarehouse, deleteWarehouse, getWarehouseById, getWarehouses, updateWarehouse } from "../../controllers/master/warehouseController.js"
import { authMiddleware } from "../../middleware/authMiddleware.js"

export const WarehouseRouter = async (req, res) => {
    const url = req.url
    const method = req.method

    if ((url === "/api/v1/warehouses" || url === "/api/v1/warehouses/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getWarehouses(req, res)
    }

    if (url.startsWith("/api/v1/warehouses/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        const id = url.split("/")[4]
        return getWarehouseById(req, res, id)
    }

    if ((url === "/api/v1/warehouses" || url === "/api/v1/warehouses/") && method === "POST") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        return createWarehouse(req, res)
    }

    if (url.startsWith("/api/v1/warehouses/") && method === "PATCH") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        const id = url.split("/")[4]
        return updateWarehouse(req, res, id)
    }

    if (url.startsWith("/api/v1/warehouses/") && method === "DELETE") {
        const allowed = await authMiddleware(req, res, ["admin"])
        if (!allowed) return
        const id = url.split("/")[4]
        return deleteWarehouse(req, res, id)
    }
}