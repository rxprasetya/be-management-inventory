import { getEmptyOrLowProductStocks, getProductInStocks, getWarehouseInStocksByProductId } from "../../controllers/inventory/inventoryController.js"
import { authMiddleware } from "../../middleware/authMiddleware.js"

export const InventoryRouter = async (req, res) => {
    const url = req.url
    const method = req.method

    if ((url === "/api/v1/inventories/products" || url === "/api/v1/inventories/products/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getProductInStocks(req, res)
    }

    if (url.startsWith("/api/v1/inventories/warehouses/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        const productID = url.split("/")[5]
        return getWarehouseInStocksByProductId(req, res, productID)
    }

    if ((url === "/api/v1/inventories/notification" || url === "/api/v1/inventories/notification/") && method === "GET") {
        const allowed = await authMiddleware(req, res)
        if (!allowed) return
        return getEmptyOrLowProductStocks(req, res)
    }
}